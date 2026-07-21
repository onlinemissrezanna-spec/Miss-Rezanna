const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const cartService = require('../services/cart.service');

const getUserIdOrGuestToken = (req) => {
    const userId = req.user ? req.user.id : null;
    const guestToken = req.headers['x-guest-token'] || req.body.guestToken || null;
    return { userId, guestToken };
};

const getCart = asyncHandler(async (req, res) => {
    const { userId, guestToken } = getUserIdOrGuestToken(req);
    const cart = await cartService.getCart(userId, guestToken);
    res.status(200).json(new ApiResponse(200, cart, 'Cart retrieved successfully'));
});

const addToCart = asyncHandler(async (req, res) => {
    const { userId, guestToken } = getUserIdOrGuestToken(req);
    const { productId, variantId, quantity } = req.body;
    
    const cart = await cartService.addToCart(userId, guestToken, productId, variantId, quantity);
    res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
});

const updateQuantity = asyncHandler(async (req, res) => {
    const { userId, guestToken } = getUserIdOrGuestToken(req);
    const { quantity } = req.body;
    const itemId = parseInt(req.params.id);

    const cart = await cartService.updateCartItemQuantity(userId, guestToken, itemId, quantity);
    res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

const removeItem = asyncHandler(async (req, res) => {
    const { userId, guestToken } = getUserIdOrGuestToken(req);
    const itemId = parseInt(req.params.id);

    const cart = await cartService.removeFromCart(userId, guestToken, itemId);
    res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
    const { userId, guestToken } = getUserIdOrGuestToken(req);
    const cart = await cartService.clearCart(userId, guestToken);
    res.status(200).json(new ApiResponse(200, cart, 'Cart cleared'));
});

const mergeCart = asyncHandler(async (req, res) => {
    const { guestToken } = req.body;
    if (req.user && guestToken) {
        await cartService.mergeGuestCart(req.user.id, guestToken);
    }
    const cart = await cartService.getCart(req.user.id, null);
    res.status(200).json(new ApiResponse(200, cart, 'Cart merged successfully'));
});

module.exports = { getCart, addToCart, updateQuantity, removeItem, clearCart, mergeCart };
