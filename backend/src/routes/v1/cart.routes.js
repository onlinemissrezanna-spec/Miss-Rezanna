const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/cart.controller');
const validate = require('../../middlewares/validate');
const { optionalAuth } = require('../../middlewares/optionalAuth.middleware');
const { protect } = require('../../middlewares/auth.middleware');
const { addToCartSchema, updateCartQuantitySchema } = require('../../validators/cart.validator');

// All cart routes accept an optional JWT, or a guest token
router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.put('/item/:id', validate(updateCartQuantitySchema), cartController.updateQuantity);
router.delete('/item/:id', cartController.removeItem);
router.delete('/', cartController.clearCart);

// Only logged in users can merge a guest cart
router.post('/merge', protect, cartController.mergeCart);

module.exports = router;
