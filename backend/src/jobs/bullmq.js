const { Queue, Worker } = require('bullmq');
const connection = require('./redis');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');

// Define Queues
const emailQueue = new Queue('email-queue', { connection });
const marketingQueue = new Queue('marketing-queue', { connection });

// Define Workers
const emailWorker = new Worker('email-queue', async job => {
    logger.info(`Processing email job ${job.id}`);
    if (job.name === 'abandoned-cart') {
        // Pseudo logic: send abandoned cart email
        // await emailService.sendAbandonedCartEmail(job.data.email, job.data.cartUrl);
    }
}, { connection });

emailWorker.on('completed', job => logger.info(`Email job ${job.id} completed`));
emailWorker.on('failed', (job, err) => logger.error(`Email job ${job.id} failed: ${err.message}`));

const addAbandonedCartJob = async (email, cartUrl) => {
    // Delay by 24 hours (for demonstration, delay 10 seconds)
    await emailQueue.add('abandoned-cart', { email, cartUrl }, { delay: 10000 });
};

module.exports = { emailQueue, marketingQueue, addAbandonedCartJob };
