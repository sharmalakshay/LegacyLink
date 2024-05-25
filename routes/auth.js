require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { sendEmail } = require('./emailservice');

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
            req.session.redirectedFromForgotPassword = true;
            // send email to user
            const subject = 'Reset Password';
            const html = `<p>Click <a href="${process.env.BASE_URL}/verify_user?email=${email}">here</a> to reset your password</p>`;
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
    res.redirect('/');
});

router.post('/retrieve_msgs', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Find user by username
        const user = await User.findOne({ username }).select('+password');
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
                // console.log('Password correct');
                return res.status(200).json({ msgs: user.messages });
            }
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/add_name', async (req, res) => {
    try {
        const { username, name, message } = req.body;
        const user = await User.findOne({
            username
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.messages.push({ name, message });
        await user.save();
        res.status(200).json({ message: 'Message added successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;