require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { router: authRoutes } = require('./routes/auth');
const authenticateJWT = require('./middleware/authenticateJWT');
const path = require('path');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

// Middleware
app.use(express.json());

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/legacylink', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Specify the public folder for serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Use authentication routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    // Check if a JWT token is present in the cookies
    const token = req.cookies.token;
    if (token) {
        try {
            // Verify the token
            jwt.verify(token, process.env.JWT_SECRET);
            // If the token is valid, redirect to the dashboard
            return res.redirect('/dashboard');
        } catch (err) {
            // If the token is not valid, serve the login page
            res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
        }
    } else {
        // If no token is present, serve the login page
        res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/login', (req, res) => {
    // Check if a JWT token is present in the cookies
    const token = req.cookies.token;
    if (token) {
        try {
            // Verify the token
            jwt.verify(token, process.env.JWT_SECRET);
            // If the token is valid, redirect to the dashboard
            return res.redirect('/dashboard');
        } catch (err) {
            // If the token is not valid, serve the login page
            res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
        }
    } else {
        // If no token is present, serve the login page
        res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
    }
});

app.get('/dashboard', (req, res) => {
    // Serve dashboard page
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

app.get('/dashboard/profile', authenticateJWT, async (req, res) => {
    try {
        // Fetch the user's profile information
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Send the user's profile information in the response
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'registration.html'));
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

module.exports = app;