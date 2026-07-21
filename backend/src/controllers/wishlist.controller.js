const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const wishlistService = require('../services/wishlist.service');

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist retrieved'));
});

const addToWishlist = asyncHandler(async (req, res) => {
    const { productId, variantId } = req.body;
    const wishlist = await wishlistService.addToWishlist(req.user.id, productId, variantId);
    res.status(200).json(new ApiResponse(200, wishlist, 'Added to wishlist'));
});

const removeItem = asyncHandler(async (req, res) => {
    const itemId = parseInt(req.params.id);
    const wishlist = await wishlistService.removeFromWishlist(req.user.id, itemId);
    res.status(200).json(new ApiResponse(200, wishlist, 'Removed from wishlist'));
});

const moveToCart = asyncHandler(async (req, res) => {
    const { itemId } = req.body;
    const wishlist = await wishlistService.moveToCart(req.user.id, parseInt(itemId));
    res.status(200).json(new ApiResponse(200, wishlist, 'Item moved to cart'));
});

module.exports = { getWishlist, addToWishlist, removeItem, moveToCart };
