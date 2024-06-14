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
        // console.error(error.message);
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

        const decryptedNamesAndMsgs = user.names
        .map(name => ({
            id: name._id,
            name: decrypt(name.name_iv, name.name),
            messages: name.messages
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort messages in descending order of createdAt
                .map(message => ({
                    id: message._id,
                    message: decrypt(message.message_iv, message.message)
                }))
        }));
        return res.status(200).json({ nameAndMsgs: decryptedNamesAndMsgs });
    } catch (error) {
        // console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add name and message route
router.post('/add_name', async (req, res) => {
    try {
        const { username, name } = req.body;
        const user = await User.findOne({ username });
        const encryptedName = encrypt(name);
        user.names.push({
            name: encryptedName.encryptedData,
            name_iv: encryptedName.iv
        });
        await user.save();
        res.status(200).json({ message: 'Name added successfully', new_name_id: user.names[user.names.length - 1]._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Add message to name route
router.post('/add_message', async (req, res) => {
    try {
        const { name_id } = req.body;
        const token = req.cookies.token;
        const user_id = jwt.decode(token).id;
        const user = await User.findOne({ _id: user_id });
        const name = user.names.id(name_id);
        const encryptedMessage = encrypt('');
        name.messages.push({ message: encryptedMessage.encryptedData, message_iv: encryptedMessage.iv });
        await user.save();
        res.status(200).json({ message: 'Message added successfully', new_msg_id: name.messages[name.messages.length - 1]._id });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Edit message route
router.post('/edit_message', async (req, res) => {
    try {
        const { name_id, msg_id, message } = req.body;
        const token = req.cookies.token;
        const user_id = jwt.decode(token).id;
        const user = await User.findOne({ _id: user_id });
        const encryptedMessage = encrypt(message);
        const name = user.names.id(name_id);
        const msg = name.messages.id(msg_id);
        msg.message = encryptedMessage.encryptedData;
        msg.message_iv = encryptedMessage.iv;
        await user.save();
        res.status(200).end();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Delete message route
router.post('/delete_name', async (req, res) => {
    try {
        const { name_id } = req.body;
        const token = req.cookies.token;
        const user_id = jwt.decode(token).id;
        const user = await User.findOne({ _id: user_id });
        const name = user.names.id(name_id);
        user.names.pull({ _id: name_id });
        await user.save();
        res.status(200).end();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Delete message route
router.post('/delete_message', async (req, res) => {
    try {
        const { name_id, msg_id } = req.body;
        const token = req.cookies.token;
        const user_id = jwt.decode(token).id;
        const user = await User.findOne({ _id: user_id });
        const name = user.names.id(name_id);
        const msg = name.messages.id(msg_id);
        name.messages.pull({ _id: msg_id });
        await user.save();
        res.status(200).end();
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Change password route
router.post('/change_password', async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await User.findOne({ username }).select('+password');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
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