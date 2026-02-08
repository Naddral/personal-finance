require('dotenv').config();
const db = require('./database/database');

const users = [
    { google_id: 'test_user_1', name: 'Mario Rossi', email: 'mario@example.com' },
    { google_id: 'test_user_2', name: 'Luigi Verdi', email: 'luigi@example.com' }
];

const transactions = [
    {
        amount: 1200.00,
        category: 'Stipendio',
        shop: 'Azienda SRL',
        description: 'Stipendio Mese Corrente',
        date: new Date().toISOString().split('T')[0],
        type: 'income'
    },
    {
        amount: 50.00,
        category: 'Spesa',
        shop: 'Coop',
        description: 'Spesa settimanale',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
    },
    {
        amount: 25.00,
        category: 'Svago',
        shop: 'Pizzeria Da Michele',
        description: 'Pizza con amici',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        type: 'expense'
    },
    {
        amount: 80.00,
        category: 'Benzina',
        shop: 'Eni Station',
        description: 'Pieno auto',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        type: 'expense'
    },
    {
        amount: 300.00,
        category: 'Affitto',
        shop: 'Padrone di casa',
        description: 'Rata affitto',
        date: new Date(Date.now() - 432000000).toISOString().split('T')[0], // 5 days ago
        type: 'expense'
    }
];

const seed = async () => {
    console.log('Seeding database...');

    try {
        // Insert Users
        for (const u of users) {
            await db.user.upsert({
                where: { googleId: u.google_id },
                update: {},
                create: {
                    googleId: u.google_id,
                    name: u.name,
                    email: u.email
                }
            });
            console.log(`User ${u.name} inserted/verified.`);
        }

        // Insert Transactions for User 1
        const user1 = await db.user.findUnique({
            where: { googleId: 'test_user_1' }
        });

        if (!user1) {
            console.error("User not found for seeding transactions");
            return;
        }

        for (const t of transactions) {
            await db.transaction.create({
                data: {
                    userId: user1.id,
                    amount: t.amount,
                    category: t.category,
                    shop: t.shop,
                    description: t.description,
                    date: t.date,
                    type: t.type
                }
            });
            console.log(`Transaction ${t.description} added.`);
        }
        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        // Note: we don't disconnect here because it might interfere if this is called elsewhere,
        // but as a standalone script it's good practice.
        // For simplicity in this demo environment, we'll let the process exit.
    }
};

seed();
