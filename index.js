require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const authenticateJWT = require('./middleware/authenticateJWT');
const path = require('path');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { sendEmail } = require('./routes/emailservice');
const { decrypt } = require('./utils/encryption'); // Import the decrypt function

const app = express();

app.set('view engine', 'ejs');

app.use(cookieParser());

// Middleware
app.use(express.json());

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to MongoDB
const mongoURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/legacylink';
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Specify the public folder for serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css/', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/js/', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));

// Middleware for session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.COOKIE_SECURE === 'true' } // Set secure cookie to true in production (https)
}));

// Use authentication routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    // Check if a JWT token is present in the cookies
    const token = req.cookies.token;
    const displayMessage = req.query.displayMessage;
    if (token) {
        try {
            // Verify the token
            jwt.verify(token, process.env.JWT_SECRET);
            // If the token is valid, redirect to the dashboard
            return res.redirect('/dashboard');
        } catch (err) {
            // If the token is not valid, serve the login page
            res.render('login');
        }
    } else {
        // If no token is present, serve the login page
        res.render('registration');
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
            res.render('login');
        }
    } else {
        // If no token is present, serve the login page
        res.render('login');
    }
});

app.get('/dashboard', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            const user_id = jwt.decode(token).id;
            User.findOne({ _id: user_id })
                .then(user => {
                    if (user) {
                        // Decrypt names and messages
                        const decryptedNamesAndMsgs = user.names
                        .map(name => ({
                            id: name._id,
                            name: decrypt(name.name_iv, name.name),
                            visibility: name.visibility,
                            messages: name.messages
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort messages in descending order of createdAt
                                .map(message => ({
                                    id: message._id,
                                    message: decrypt(message.message_iv, message.message)
                                }))
                        }));
                        // Render the dashboard page with the user's data
                        res.render('dashboard', { user: user, nameAndMsgs: decryptedNamesAndMsgs });
                    } else {
                        res.redirect('/logout');
                    }
                })
                .catch(err => {
                    // console.error(err);
                    res.status(500).send(err);
                });
        } catch (err) {
            // console.error(err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
});

app.get('/registration', (req, res) => {
    res.render('registration');
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/forgot_password', (req, res) => {
    const error = req.query.error;
    res.render('forgot_password', { error });
});

app.get('/verify_user', (req, res) => {
    if (!req.session.verifyUser) {
        return res.redirect('/forgot_password');
    }
    delete req.session.verifyUser;
    const email = req.query.email;
    const error = req.query.error;
    res.render('verify_user', { email, error });
});

app.get('/reset_password', (req, res) => {
    if (!req.session.resetPassword) {
        return res.redirect('/forgot_password');
    }
    delete req.session.resetPassword;
    const email = req.query.email;
    res.render('reset_password', { email });
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'terms.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'privacy.html'));
});

app.use((req, res, next) => {
    if (req.path.split('/').length > 2) {
        // res.status(404).send('Not found');
        res.redirect('/');
    } else {
        User.findOne({ username: req.path.split('/')[1] })
            .then(user => {
                if (user) {
                    // Render the profile page with the user's data
                    res.render('profile', { user: user });
                } else {
                    res.status(404).send('User Not found');
                }
            })
            .catch(err => {
                res.status(500).send('Server error');
            });
    }
});

module.exports = app;