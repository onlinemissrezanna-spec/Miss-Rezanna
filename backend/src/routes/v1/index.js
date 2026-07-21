const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const addressRoutes = require('./address.routes');
const shippingRoutes = require('./shipping.routes');
const couponRoutes = require('./coupon.routes');
const checkoutRoutes = require('./checkout.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const customerRoutes = require('./customer.routes');
const reviewRoutes = require('./review.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/customer', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/address', addressRoutes);
router.use('/shipping', shippingRoutes);
router.use('/coupons', couponRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running successfully' });
});

module.exports = router;
