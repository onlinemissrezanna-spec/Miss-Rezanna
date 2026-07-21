require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

async function bootstrap() {
    try {
        // Test DB Connection
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        server = app.listen(PORT, () => {
            console.log('Server running in ' + process.env.NODE_ENV + ' mode on port ' + PORT);
        });

    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}

bootstrap();

// Graceful shutdown
process.on('SIGINT', async () => {
    if (server) {
        server.close(async () => {
            await prisma.$disconnect();
            console.log('Server closed and database disconnected.');
            process.exit(0);
        });
    }
});
