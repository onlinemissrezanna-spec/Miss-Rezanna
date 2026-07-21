const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const couponService = require('../services/coupon.service');
const cartService = require('../services/cart.service');

const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.params;
    
    // Get cart to calculate subtotal
    const cart = await cartService.getCart(req.user.id, null);
    if (!cart || cart.items.length === 0) {
        return res.status(400).json(new ApiResponse(400, null, 'Cart is empty'));
    }

    const { coupon, discount } = await couponService.validateCoupon(code, cart.totals.subtotal, req.user.id);
    
    res.status(200).json(new ApiResponse(200, { coupon, discount }, 'Coupon is valid'));
});

module.exports = { validateCoupon };
