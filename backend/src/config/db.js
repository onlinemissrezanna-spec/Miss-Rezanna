const { PrismaClient } = require('@prisma/client');

let prisma;
try {
    prisma = new PrismaClient({
        log: ['error', 'warn']
    });
} catch (error) {
    console.error('PrismaClient initialization error:', error.message);
    prisma = new PrismaClient();
}

module.exports = prisma;
