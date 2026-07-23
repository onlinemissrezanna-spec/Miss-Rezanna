const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');
const prisma = require('../config/db');
const crypto = require('crypto');

const createOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const razorpayData = await paymentService.createPaymentOrder(orderId, req.user.id);
    res.status(200).json(new ApiResponse(200, razorpayData, 'Razorpay order created'));
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { orderId, paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    
    await paymentService.verifyPayment(
        orderId, 
        paymentId, 
        razorpayPaymentId, 
        razorpayOrderId, 
        razorpaySignature, 
        req.user.id
    );
    
    res.status(200).json(new ApiResponse(200, null, 'Payment verified and order confirmed successfully'));
});

// Unprotected Route for Webhooks from Razorpay Background Servers
const handleWebhook = asyncHandler(async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return res.status(200).send('OK');

    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).send('Invalid signature');
    }

    // Log the payload to prevent replay attacks
    const payloadLog = await prisma.webhookLog.create({
        data: {
            eventType: req.body.event,
            payload: body,
            signature
        }
    });

    const event = req.body.event;

    // Async handling of the event (e.g. payment.failed, refund.processed)
    if (event === 'payment.captured') {
        // Logic to verify order and fulfill if missed by frontend
    } else if (event === 'payment.failed') {
        // Logic to mark payment as failed
    }

    await prisma.webhookLog.update({ where: { id: payloadLog.id }, data: { processed: true } });

    res.status(200).send('Webhook processed');
});

const guestCheckout = asyncHandler(async (req, res) => {
    const { amount, customer, items } = req.body;
    if (!amount) throw new ApiError(400, 'Amount is required');
    
    const razorpayData = await paymentService.createGuestPaymentOrder(amount, customer, items);
    res.status(200).json(new ApiResponse(200, razorpayData, 'Guest Razorpay order created'));
});

const verifyGuestCheckout = asyncHandler(async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, customer, items, amount } = req.body;
    
    await paymentService.verifyGuestPayment(razorpayPaymentId, razorpayOrderId, razorpaySignature, customer, items, amount);
    
    res.status(200).json(new ApiResponse(200, null, 'Guest payment verified successfully'));
});

module.exports = { createOrder, verifyPayment, handleWebhook, guestCheckout, verifyGuestCheckout };
