const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all transactions for the current user (with filtering support)
router.get('/api/transactions', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, category, startDate, endDate } = req.query;
    let sql = `SELECT * FROM transactions WHERE user_id = ?`;
    const params = [req.session.userId];

    if (type) {
        sql += ` AND type = ?`;
        params.push(type);
    }
    if (category) {
        sql += ` AND category LIKE ?`;
        params.push(`%${category}%`);
    }
    if (startDate) {
        sql += ` AND date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        sql += ` AND date <= ?`;
        params.push(endDate);
    }

    sql += ` ORDER BY date DESC`;

    console.log('SQL Query:', sql);
    console.log('Query Params:', params);

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Database Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST a new transaction
router.post('/api/transactions', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, category, shop, description, date, type } = req.body;

    // Basic validation
    if (!amount || !date || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO transactions (user_id, amount, category, shop, description, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [req.session.userId, amount, category, shop, description, date, type];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id: this.lastID,
            ...req.body
        });
    });
});

// PUT (update) an existing transaction
router.put('/api/transactions/:id', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, category, shop, description, date, type } = req.body;
    const transactionId = req.params.id;

    // First check if the transaction belongs to the user
    db.get("SELECT * FROM transactions WHERE id = ? AND user_id = ?", [transactionId, req.session.userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }

        const sql = `UPDATE transactions SET amount = ?, category = ?, shop = ?, description = ?, date = ?, type = ? WHERE id = ? AND user_id = ?`;
        const params = [amount, category, shop, description, date, type, transactionId, req.session.userId];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                id: transactionId,
                ...req.body
            });
        });
    });
});

// DELETE a transaction
router.delete('/api/transactions/:id', (req, res) => {
    if (!req.session.userId) {
        console.error('Delete failed: Unauthorized');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const transactionId = req.params.id;
    console.log('Attempting to delete transaction:', transactionId, 'for user:', req.session.userId);

    const sql = `DELETE FROM transactions WHERE id = ? AND user_id = ?`;
    db.run(sql, [transactionId, req.session.userId], function (err) {
        if (err) {
            console.error('Delete error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Delete result changes:', this.changes);
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }
        res.json({ message: 'Transaction deleted' });
    });
});

module.exports = router;
