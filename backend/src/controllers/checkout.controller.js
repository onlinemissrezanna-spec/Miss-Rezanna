const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const checkoutService = require('../services/checkout.service');

const createCheckout = asyncHandler(async (req, res) => {
    const { addressId, shippingMethodId, couponCode } = req.body;
    const order = await checkoutService.processCheckout(req.user.id, addressId, shippingMethodId, couponCode);
    
    res.status(201).json(new ApiResponse(201, order, 'Order created successfully. Pending payment.'));
});

module.exports = { createCheckout };
