const chatService = require('../services/chat.service');
const logger = require('../utils/logger');

/**
 * POST /api/v1/chat
 * Handles customer chat messages and returns AI-generated responses.
 *
 * Request body:
 *   - message: string (required) — the customer's question
 *   - conversationHistory: array (optional) — previous messages for context
 *     Each entry: { role: 'user' | 'model', parts: [{ text: '...' }] }
 *
 * Response:
 *   - success: boolean
 *   - reply: string — the AI response (may contain HTML links)
 */
const sendMessage = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Message is required and must be a non-empty string.'
            });
        }

        // Limit message length to prevent abuse
        const trimmedMessage = message.trim().substring(0, 1000);

        // Validate and sanitize conversation history
        let history = [];
        if (Array.isArray(conversationHistory)) {
            history = conversationHistory
                .filter(entry =>
                    entry &&
                    typeof entry.role === 'string' &&
                    ['user', 'model'].includes(entry.role) &&
                    Array.isArray(entry.parts) &&
                    entry.parts.length > 0 &&
                    typeof entry.parts[0].text === 'string'
                )
                .slice(-10) // Keep only last 10 messages for context window
                .map(entry => ({
                    role: entry.role,
                    parts: [{ text: entry.parts[0].text.substring(0, 2000) }]
                }));
        }

        const reply = await chatService.chat(trimmedMessage, history);

        return res.status(200).json({
            success: true,
            reply: reply
        });

    } catch (error) {
        logger.error('[ChatController] Error processing chat message:', error.message);
        return res.status(500).json({
            success: false,
            reply: 'I apologize for the inconvenience. Our AI assistant is temporarily unavailable. Please reach out to us on <a href="https://wa.me/919877327186" target="_blank">WhatsApp (+91 98773 27186)</a> for immediate assistance. ✦',
            error: 'Internal server error'
        });
    }
};

module.exports = { sendMessage };
