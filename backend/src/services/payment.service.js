const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const invoiceService = require('./invoice.service');
const emailService = require('./email.service');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

const createPaymentOrder = async (orderId, userId) => {
    const order = await prisma.order.findUnique({ where: { id: orderId, userId } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentStatus === 'Paid') throw new ApiError(400, 'Order is already paid');

    // Amount in paise
    const amountInPaise = Math.round(parseFloat(order.grandTotal) * 100);

    let gatewayOrderId = null;

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_mock') {
        const rzpOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${order.orderNumber}`,
            payment_capture: 1
        });
        gatewayOrderId = rzpOrder.id;
    } else {
        // Mock gateway order ID for local testing if Razorpay keys aren't set
        gatewayOrderId = `mock_order_${Date.now()}`;
    }

    const payment = await prisma.payment.create({
        data: {
            orderId: order.id,
            userId,
            gatewayOrderId,
            amount: order.grandTotal,
            status: 'Pending'
        }
    });

    return {
        key: process.env.RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'MISS REZANNA',
        description: `Order ${order.orderNumber}`,
        order_id: gatewayOrderId,
        payment_id: payment.id // internal reference
    };
};

const verifyPayment = async (orderId, paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature, userId) => {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId, userId } });
    if (!payment) throw new ApiError(404, 'Payment record not found');
    if (payment.status === 'Paid') return true;

    // Cryptographic Signature Verification
    if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'mock_secret') {
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            await prisma.payment.update({ where: { id: paymentId }, data: { status: 'Failed', failureReason: 'Signature Mismatch' } });
            throw new ApiError(400, 'Payment verification failed');
        }
    }

    // Fulfillment Transaction
    await prisma.$transaction(async (tx) => {
        // 1. Update Payment
        await tx.payment.update({
            where: { id: paymentId },
            data: {
                status: 'Paid',
                gatewayPaymentId: razorpayPaymentId,
                gatewaySignature: razorpaySignature,
                paidAt: new Date()
            }
        });

        // 2. Update Order
        const order = await tx.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'Paid', orderStatus: 'Confirmed' },
            include: {
                user: true,
                shippingAddress: true,
                items: { include: { product: true } }
            }
        });

        // 3. Generate Invoice
        const invoiceNumber = `INV-${Date.now()}`;
        const invoice = await tx.invoice.create({
            data: { orderId: order.id, invoiceNumber }
        });
        
        order.invoice = invoice;

        // 4. Create Audit Log
        await tx.paymentAudit.create({
            data: { paymentId, action: 'VERIFIED', performedBy: 'SYSTEM', newStatus: 'Paid' }
        });
        
        // 5. Build PDF (We call it asynchronously but wait for it in a real system or background job)
        // For this demo, we await it.
        const invoiceUrl = await invoiceService.generateInvoice(order);
        await tx.invoice.update({ where: { id: invoice.id }, data: { invoiceUrl } });

        // 6. Send Email
        await emailService.sendOrderConfirmationEmail(order.user.email, order.orderNumber, null);
    });

    return true;
};

module.exports = { createPaymentOrder, verifyPayment };
