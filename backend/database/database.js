const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function connect() {
    try {
        await prisma.$connect();
        console.log('Connected to the PostgreSQL database via Prisma.');
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
    }
}

connect();

module.exports = prisma;
