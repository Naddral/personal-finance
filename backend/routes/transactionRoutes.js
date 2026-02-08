const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all transactions for the current user (with filtering support)
router.get('/api/transactions', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, category, startDate, endDate } = req.query;

    try {
        const transactions = await db.transaction.findMany({
            where: {
                userId: req.session.userId,
                type: type || undefined,
                category: category ? { contains: category, mode: 'insensitive' } : undefined,
                date: {
                    gte: startDate || undefined,
                    lte: endDate || undefined,
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.json(transactions);
    } catch (err) {
        console.error('Database Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST a new transaction
router.post('/api/transactions', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, category, shop, description, date, type } = req.body;

    // Basic validation
    if (!amount || !date || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const transaction = await db.transaction.create({
            data: {
                userId: req.session.userId,
                amount: parseFloat(amount),
                category,
                shop,
                description,
                date,
                type
            }
        });
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT (update) an existing transaction
router.put('/api/transactions/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, category, shop, description, date, type } = req.body;
    const transactionId = parseInt(req.params.id);

    try {
        // First check if the transaction belongs to the user
        const existing = await db.transaction.findFirst({
            where: {
                id: transactionId,
                userId: req.session.userId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }

        const updated = await db.transaction.update({
            where: { id: transactionId },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                category,
                shop,
                description,
                date,
                type
            }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a transaction
router.delete('/api/transactions/:id', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactionId = parseInt(req.params.id);

    try {
        const existing = await db.transaction.findFirst({
            where: {
                id: transactionId,
                userId: req.session.userId
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Transaction not found or unauthorized' });
        }

        await db.transaction.delete({
            where: { id: transactionId }
        });
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error('Delete error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
