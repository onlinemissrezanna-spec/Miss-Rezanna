const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/checkout.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { createCheckoutSchema } = require('../../validators/checkout.validator');

router.use(protect);
router.post('/', validate(createCheckoutSchema), checkoutController.createCheckout);

module.exports = router;
