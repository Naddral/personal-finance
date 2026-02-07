const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database/database');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        db.get("SELECT * FROM users WHERE google_id = ?", [googleId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                // Create user
                db.run("INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)",
                    [googleId, name, email],
                    function (err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        const newUser = { id: this.lastID, google_id: googleId, name, email };
                        // Create session manually (simple implementation)
                        // In production, use express-session or JWT
                        // For this demo, we'll assume the client stores the Google token or user info
                        // BUT better to set a session here if using express-session
                        req.session.userId = newUser.id;
                        return res.status(201).json(newUser);
                    }
                );
            } else {
                // User exists
                req.session.userId = row.id;
                return res.json(row);
            }
        });

    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

router.get('/api/current_user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json(null);
    }
    db.get("SELECT * FROM users WHERE id = ?", [req.session.userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
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
