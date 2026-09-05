const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'mysql://root:password@127.0.0.1:3306/missrezanna';
}

// Append connection pool parameters to DATABASE_URL if missing
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')) {
    const sep = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL += `${sep}connection_limit=10&pool_timeout=30`;
}

let prisma;
try {
    prisma = new PrismaClient({
        log: ['error', 'warn']
    });

    // Auto-reconnect middleware for stale/closed MySQL connections
    prisma.$use(async (params, next) => {
        try {
            return await next(params);
        } catch (error) {
            if (error.message && (error.message.includes('closed the connection') || error.message.includes('Kind: Closed') || error.message.includes('ECONNRESET'))) {
                console.warn('Prisma DB connection dropped by server. Reconnecting...');
                try {
                    await prisma.$disconnect();
                    await prisma.$connect();
                    return await next(params);
                } catch (reconnectError) {
                    console.error('Prisma reconnect failed:', reconnectError.message);
                    throw error;
                }
            }
            throw error;
        }
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
