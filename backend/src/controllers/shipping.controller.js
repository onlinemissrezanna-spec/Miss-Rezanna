const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const shippingService = require('../services/shipping.service');

const getShippingMethods = asyncHandler(async (req, res) => {
    const methods = await shippingService.getShippingMethods();
    res.status(200).json(new ApiResponse(200, methods, 'Shipping methods retrieved'));
});

module.exports = { getShippingMethods };
