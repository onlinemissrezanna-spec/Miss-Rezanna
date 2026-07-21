const Redis = require('ioredis');
const logger = require('../utils/logger');

let connection = null;

if (process.env.REDIS_URL) {
    connection = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });

    connection.on('error', (err) => {
        logger.error('Redis connection error:', err);
    });
} else {
    logger.warn('No REDIS_URL provided. Background jobs (BullMQ) will be disabled.');
}

module.exports = connection;
