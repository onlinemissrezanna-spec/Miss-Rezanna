require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

let server;

// Start HTTP server immediately on 0.0.0.0 so Railway health checks ALWAYS pass
server = app.listen(PORT, '0.0.0.0', () => {
    console.log('Primary server running in ' + (process.env.NODE_ENV || 'development') + ' mode on port ' + PORT);
});

// If Railway injects a dynamic PORT (e.g. 7085) but Railway proxy targets port 5000,
// listen on port 5000 as well so traffic to EITHER port succeeds seamlessly!
if (process.env.PORT && String(process.env.PORT) !== '5000') {
    try {
        app.listen(5000, '0.0.0.0', () => {
            console.log('Secondary server listening on port 5000');
        });
    } catch (e) {
        console.warn('Secondary port 5000 listener info:', e.message);
    }
}

// Safely connect to database in background
async function connectDB(retries = 10) {
    const prisma = require('./config/db');
    for (let i = 1; i <= retries; i++) {
        try {
            await prisma.$connect();
            console.log('Successfully connected to the database.');
            return;
        } catch (error) {
            console.error(`DB connection attempt ${i}/${retries} failed:`, error.message);
            if (i < retries) {
                await new Promise(r => setTimeout(r, 5000));
            } else {
                console.error('All DB connection attempts failed. Server continues running.');
            }
        }
    }
}

connectDB().catch(err => console.error('DB connect background error:', err.message));

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    if (server) {
        server.close(async () => {
            try {
                const prisma = require('./config/db');
                await prisma.$disconnect();
            } catch (e) {}
            console.log('Server closed and database disconnected.');
            process.exit(0);
        });
    }
});
