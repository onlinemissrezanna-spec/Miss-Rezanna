const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/payment.controller');
const { protect } = require('../../middlewares/auth.middleware');

// Webhook must be public and unprocessed by JSON body parsers if you want raw body, 
// but for simplicity we rely on standard JSON parser.
router.post('/webhook', paymentController.handleWebhook);

// Guest checkout routes (Unprotected)
router.post('/guest-checkout', paymentController.guestCheckout);
router.post('/guest-verify', paymentController.verifyGuestCheckout);

// Protected routes
router.use(protect);
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
