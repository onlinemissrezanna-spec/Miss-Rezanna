const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } = require('../../validators/auth.validator');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many login attempts, please try again later' });

router.post('/register', validate(registerSchema), authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
