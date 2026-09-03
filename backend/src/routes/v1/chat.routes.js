const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const chatController = require('../../controllers/chat.controller');

// Rate limiter specific to chat endpoint: 20 messages per minute per IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        reply: 'You are sending messages too quickly. Please wait a moment before trying again. ✦',
        error: 'Too many requests'
    }
});

// POST /api/v1/chat — public endpoint, no auth required
router.post('/', chatLimiter, chatController.sendMessage);

module.exports = router;
