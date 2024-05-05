require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authenticateJWT = require('./middleware/authenticateJWT');
const path = require('path');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

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
    // Check if a JWT token is present in the cookies
    const token = req.cookies.token;
    if (token) {
        try {
            // Verify the token
            jwt.verify(token, process.env.JWT_SECRET);
            // If the token is valid, redirect to the dashboard
            const user_id = jwt.decode(token).id;
            User.findOne({ _id: user_id })
            .then(user => {
                if (user) {
                    // Render the dashboard page with the user's data
                    res.render('dashboard', { user: user });
                } else {
                    res.status(404).send('User Info Not found');
                }
            })
            .catch(err => {
                res.status(500).send('Server error');
            });
        } catch (err) {
            // If the token is not valid, serve the login page
            res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
        }
    } else {
        // If no token is present, serve the login page
        res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
    }
});

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'registration.html'));
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.use((req, res, next) => {
    if (req.path.split('/').length > 2) {
        res.status(404).send('Not found');
    } else {
        User.findOne({ username: req.path.split('/')[1] })
            .then(user => {
                if (user) {
                    // Render the profile page with the user's data
                    res.render('profile', { user: user });
                } else {
                    res.status(404).send('Not found');
                }
            })
            .catch(err => {
                res.status(500).send('Server error');
            });
    }
});

module.exports = app;