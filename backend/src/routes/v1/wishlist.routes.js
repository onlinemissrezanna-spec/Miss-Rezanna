const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/wishlist.controller');
const validate = require('../../middlewares/validate');
const { protect } = require('../../middlewares/auth.middleware');
const { addToWishlistSchema } = require('../../validators/wishlist.validator');

// Wishlist requires active logged-in user
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.post('/', validate(addToWishlistSchema), wishlistController.addToWishlist);
router.delete('/:id', wishlistController.removeItem);
router.post('/move-to-cart', wishlistController.moveToCart);

module.exports = router;
