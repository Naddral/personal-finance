const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const session = require('express-session');
// const passport = require('passport'); // Removed
// require('./config/passport'); // Removed

app.use(cors({
    origin: 'http://localhost:5173', // Allow frontend origin
    credentials: true // Allow cookies
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// app.use(passport.initialize()); // Removed
// app.use(passport.session()); // Removed

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use(authRoutes);
app.use(transactionRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
