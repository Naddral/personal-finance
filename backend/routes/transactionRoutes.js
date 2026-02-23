const express = require('express');
const router = express.Router();
const db = require('../database/database');

function roundCurrency(value) {
    return Math.round(value * 100) / 100;
}

function parseSemicolonCsvLine(line) {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ';' && !inQuotes) {
            cells.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    cells.push(current.trim());
    return cells;
}

function normalizeDate(rawDate) {
    if (!rawDate) {
        return null;
    }

    const value = rawDate.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        const [, day, month, year] = slashMatch;
        const normalizedDay = day.padStart(2, '0');
        const normalizedMonth = month.padStart(2, '0');
        return `${year}-${normalizedMonth}-${normalizedDay}`;
    }

    return null;
}

function normalizeAmount(rawAmount) {
    if (!rawAmount) {
        return null;
    }

    let value = rawAmount.trim().replace(/\s+/g, '');

    const hasComma = value.includes(',');
    const hasDot = value.includes('.');

    if (hasComma && hasDot) {
        if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
            value = value.replace(/\./g, '').replace(',', '.');
        } else {
            value = value.replace(/,/g, '');
        }
    } else if (hasComma) {
        value = value.replace(',', '.');
    }

    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed === 0) {
        return null;
    }

    return roundCurrency(parsed);
}

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
                amount: roundCurrency(parseFloat(amount)),
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

// POST import transactions from CSV text
router.post('/api/transactions/import-csv', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { csvContent } = req.body;

    if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ error: 'Missing csvContent' });
    }

    const lines = csvContent
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) {
        return res.status(400).json({ error: 'CSV must contain header and at least one row' });
    }

    const header = parseSemicolonCsvLine(lines[0]).map((h) => h.toLowerCase());
    const expectedHeader = ['data', 'importo', 'categoria', 'negozio', 'descrizione'];
    const hasValidHeader = expectedHeader.every((column, index) => header[index] === column);

    if (!hasValidHeader) {
        return res.status(400).json({
            error: 'Invalid CSV header. Expected: Data;Importo;Categoria;Negozio;Descrizione'
        });
    }

    const toCreate = [];
    const errors = [];

    for (let i = 1; i < lines.length; i += 1) {
        const lineNumber = i + 1;
        const [rawDate, rawAmount, rawCategory, rawShop, rawDescription] = parseSemicolonCsvLine(lines[i]);
        const date = normalizeDate(rawDate);
        const signedAmount = normalizeAmount(rawAmount);

        if (!date || signedAmount === null) {
            errors.push({
                line: lineNumber,
                reason: 'Invalid date or amount'
            });
            continue;
        }

        const type = signedAmount < 0 ? 'expense' : 'income';
        const amount = Math.abs(signedAmount);

        toCreate.push({
            userId: req.session.userId,
            date,
            amount,
            type,
            category: rawCategory || 'Uncategorized',
            shop: rawShop || '',
            description: rawDescription || ''
        });
    }

    if (toCreate.length === 0) {
        return res.status(400).json({
            error: 'No valid rows found',
            errors
        });
    }

    try {
        const result = await db.transaction.createMany({
            data: toCreate
        });

        return res.status(201).json({
            imported: result.count,
            skipped: errors.length,
            errors
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
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
                amount: amount ? roundCurrency(parseFloat(amount)) : undefined,
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
