const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/order.controller');
const { protect } = require('../../middlewares/auth.middleware');
const { adminOnly } = require('../../middlewares/admin.middleware');

router.use(protect);

// Customer
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);

// Admin
router.use(adminOnly);
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
