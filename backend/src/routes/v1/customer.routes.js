const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customer.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { updateProfileSchema, changePasswordSchema, returnRequestSchema, cancelOrderSchema } = require('../../validators/customer.validator');

// All customer routes require active login
router.use(protect);

// Dashboard
router.get('/dashboard', customerController.getDashboard);

// Profile
router.put('/profile', validate(updateProfileSchema), customerController.updateProfile);
router.post('/change-password', validate(changePasswordSchema), customerController.changePassword);
router.delete('/account', customerController.deleteAccountRequest);

// Orders & Tracking
router.get('/orders/:id/track', customerController.trackOrder);
router.post('/orders/:id/cancel', validate(cancelOrderSchema), customerController.cancelOrder);
router.post('/returns', validate(returnRequestSchema), customerController.createReturnRequest);

// Notifications
router.get('/notifications', customerController.getNotifications);
router.put('/notifications/read-all', customerController.markAllNotificationsRead);
router.put('/notifications/:id/read', customerController.markNotificationRead);

module.exports = router;
