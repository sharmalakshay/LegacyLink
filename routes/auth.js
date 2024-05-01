const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
	try {
		const { username, email, password } = req.body;
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}
		// Create new user
		const newUser = new User({ username, email, password });
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
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		// Check password
		if (password !== user.password) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}
		// Authentication successful
		res.status(200).json({ message: 'Login successful' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server Error' });
	}
});

module.exports = router;