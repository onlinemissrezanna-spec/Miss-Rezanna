const express = require('express');
const { html: adminHtml, js: adminJs, css: adminCss } = require('../../adminHtmlContent');

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const cartRoutes = require('./cart.routes');
const wishlistRoutes = require('./wishlist.routes');
const addressRoutes = require('./address.routes');
const checkoutRoutes = require('./checkout.routes');
const paymentRoutes = require('./payment.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const adminRoutes = require('./admin.routes');
const customerRoutes = require('./customer.routes');
const couponRoutes = require('./coupon.routes');
const shippingRoutes = require('./shipping.routes');
const seedRoutes = require('./seed.routes');

const router = express.Router();

// Admin Portal Web Pages inside API router
router.get(['/admin-portal', '/admin.html', '/admin-page'], (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(adminHtml);
});

router.get(['/js/admin.js', '/admin.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.status(200).send(adminJs);
});

router.get(['/css/admin.css', '/admin.css'], (req, res) => {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.status(200).send(adminCss);
});

const defaultRoutes = [
    { path: '/auth', route: authRoutes },
    { path: '/users', route: userRoutes },
    { path: '/products', route: productRoutes },
    { path: '/categories', route: categoryRoutes },
    { path: '/cart', route: cartRoutes },
    { path: '/wishlist', route: wishlistRoutes },
    { path: '/addresses', route: addressRoutes },
    { path: '/checkout', route: checkoutRoutes },
    { path: '/payment', route: paymentRoutes },
    { path: '/orders', route: orderRoutes },
    { path: '/reviews', route: reviewRoutes },
    { path: '/admin', route: adminRoutes },
    { path: '/customer', route: customerRoutes },
    { path: '/coupons', route: couponRoutes },
    { path: '/shipping', route: shippingRoutes },
    { path: '/seed', route: seedRoutes }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running successfully' });
});

module.exports = router;
