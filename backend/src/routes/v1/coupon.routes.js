const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/coupon.controller');
const { protect } = require('../../middlewares/auth.middleware');

router.use(protect);
router.get('/validate/:code', couponController.validateCoupon);

module.exports = router;
