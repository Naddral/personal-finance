const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database/database');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }

    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch (error) {
        console.error('Error verifying Google token:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        const { sub: googleId, email, name } = payload;

        let user = await db.user.findUnique({
            where: { googleId: googleId }
        });

        if (!user) {
            // Create user
            user = await db.user.create({
                data: {
                    googleId: googleId,
                    name: name,
                    email: email
                }
            });
            req.session.userId = user.id;
            return res.status(201).json(user);
        } else {
            // User exists
            req.session.userId = user.id;
            return res.json(user);
        }

    } catch (error) {
        console.error('Error completing Google auth flow:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
});

router.get('/api/current_user', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json(null);
    }

    try {
        const user = await db.user.findUnique({
            where: { id: req.session.userId }
        });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
});

module.exports = router;
