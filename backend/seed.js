const db = require('./database/database');

const users = [
    { google_id: 'test_user_1', name: 'Mario Rossi', email: 'mario@example.com' },
    { google_id: 'test_user_2', name: 'Luigi Verdi', email: 'luigi@example.com' }
];

const transactions = [
    {
        user_id: 1, // Will assign to first user
        amount: 1200.00,
        category: 'Stipendio',
        shop: 'Azienda SRL',
        description: 'Stipendio Mese Corrente',
        date: new Date().toISOString().split('T')[0],
        type: 'income'
    },
    {
        user_id: 1,
        amount: 50.00,
        category: 'Spesa',
        shop: 'Coop',
        description: 'Spesa settimanale',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
    },
    {
        user_id: 1,
        amount: 25.00,
        category: 'Svago',
        shop: 'Pizzeria Da Michele',
        description: 'Pizza con amici',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        type: 'expense'
    },
    {
        user_id: 1,
        amount: 80.00,
        category: 'Benzina',
        shop: 'Eni Station',
        description: 'Pieno auto',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
        type: 'expense'
    },
    {
        user_id: 1,
        amount: 300.00,
        category: 'Affitto',
        shop: 'Padrone di casa',
        description: 'Rata affitto',
        date: new Date(Date.now() - 432000000).toISOString().split('T')[0], // 5 days ago
        type: 'expense'
    }
];

const seed = () => {
    console.log('Seeding database...');

    // Insert Users
    users.forEach(u => {
        db.run(`INSERT OR IGNORE INTO users (google_id, name, email) VALUES (?, ?, ?)`,
            [u.google_id, u.name, u.email],
            function (err) {
                if (err) console.error(err);
                else console.log(`User ${u.name} inserted/verified.`);
            }
        );
    });

    // Insert Transactions for User 1
    // We wait a bit to ensure user 1 exists (simple hack for this script)
    setTimeout(() => {
        db.get("SELECT id FROM users WHERE google_id = ?", ['test_user_1'], (err, row) => {
            if (err || !row) {
                console.error("User not found for seeding transactions");
                return;
            }
            const userId = row.id;

            transactions.forEach(t => {
                db.run(`INSERT INTO transactions (user_id, amount, category, shop, description, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, t.amount, t.category, t.shop, t.description, t.date, t.type],
                    (err) => {
                        if (err) console.error(err);
                        else console.log(`Transaction ${t.description} added.`);
                    }
                );
            });
        });
    }, 1000);
};

seed();
