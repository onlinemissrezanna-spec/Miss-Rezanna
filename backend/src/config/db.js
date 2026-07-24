const { PrismaClient } = require('@prisma/client');

// Provide fallback DATABASE_URL if missing so PrismaClient constructor never throws during module load
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'mysql://root:password@127.0.0.1:3306/missrezanna';
}

let prisma;
try {
    prisma = new PrismaClient({
        log: ['error', 'warn']
    });
} catch (error) {
    console.error('PrismaClient initialization warning:', error.message);
    prisma = new Proxy({}, {
        get() {
            return () => Promise.reject(new Error('Database not connected. Please set DATABASE_URL in Railway.'));
        }
    });
}

module.exports = prisma;
