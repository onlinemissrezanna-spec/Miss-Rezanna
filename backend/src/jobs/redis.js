const Redis = require('ioredis');

// Connect to Redis. Defaults to localhost:6379 for local dev.
const connection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = connection;
