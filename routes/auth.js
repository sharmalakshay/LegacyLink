const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
	try {
		const { username, email, password } = req.body;
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}
		// Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
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
		const user = await User.findOne({ email: req.body.email }).select('+password');
		if (!user) {
			// handle user not found
			console.error('User not found');
			return res.status(404).json({ message: 'User not found' });
		} else {
			// Check password
			const isMatch = await user.comparePassword(password);
			if (!isMatch) {
				// handle invalid credentials
				console.error('Invalid credentials');
				console.log(user.password);
				console.log(password);
				return res.status(401).json({ message: 'Invalid credentials' });
			} else {
				// handle login success
				console.log('Login successful');
				return res.status(200).json({ message: 'Login successful' });
			}
		}
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: 'Server Error' });
	}
});

module.exports = router;