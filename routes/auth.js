require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { sendEmail } = require('./emailservice');
const { encrypt, decrypt } = require('../utils/encryption');

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            // handle user not found
            // console.error('User not found');
            return res.status(404).json({ message: 'User not found' });
        } else {
            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                // handle invalid credentials
                // console.error('Invalid credentials');
                return res.status(401).json({ message: 'Invalid credentials' });
            } else {
                // handle login success
                // console.log('Login successful');
                const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie('token', token, { httpOnly: true }); // set cookie
                return res.status(200).json({ message: 'Login successful', token });
            }
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/forgot_password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne ({ email });
        if (!user) {
            const error = 'User not found';
            return res.redirect('/forgot_password?error=User not found');
        }
        else {
            req.session.verifyUser = true;
            const verification_code = Math.floor(100000 + Math.random() * 900000);
            user.verification_code = verification_code;
            await user.save();
            // send email to user
            const subject = 'Reset Password';
            const html = `<p>Your verification code is: ${verification_code}</p>`;
            sendEmail(email, subject, html).then(() => {
                return res.redirect('/verify_user?email=' + email);
            })
            .catch((error) => {
                console.error(error);
                return res.redirect('/forgot_password?error=' + error.message);
            });          
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/verify_user', async (req, res) => {
    try {
        const { email, verification_code } = req.body;
        const user = await User.findOne({ email });
        if (user.verification_code !== verification_code) {
            req.session.verifyUser = true;
            return res.redirect('/verify_user?email=' + email + '&error=Invalid verification code');
        }
        req.session.resetPassword = true;
        return res.redirect('/reset_password?email=' + email);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/reset_password', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        
        // login if same password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true }); // set cookie
            return res.render('redirect_message', { message: 'New password is same as old password. Logging in!'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }); // set cookie
        return res.render('redirect_message', { message: 'Password reset successfully. Logging in!' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/retrieve_msgs', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username }).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const decryptedMessages = user.messages.map(msg => ({
            name: decrypt(msg.name_iv, msg.name),
            message: decrypt(msg.message_iv, msg.message)
        }));
        return res.status(200).json({ msgs: decryptedMessages });
    } catch (error) {
        // console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add name and message route
router.post('/add_name', async (req, res) => {
    try {
        const { username, name, message } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const encryptedName = encrypt(name);
        const encryptedMessage = encrypt(message);
        user.messages.push({
            name: encryptedName.encryptedData,
            name_iv: encryptedName.iv,
            message: encryptedMessage.encryptedData,
            message_iv: encryptedMessage.iv
        });
        await user.save();
        res.status(200).json({ message: 'Message added successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Delete message route
router.post('/delete_name', async (req, res) => {
    try {
        const { username, index } = req.body;
        const user = await User.findOne({ username });
        user.messages.splice(index, 1);
        await user.save();
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Get User Count
router.get('/get_user_count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.status(200).json({ count });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;