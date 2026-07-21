const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const adminProductService = require('../services/admin-product.service');

const bulkUpdateStatus = asyncHandler(async (req, res) => {
    const { productIds, status } = req.body;
    await adminProductService.bulkUpdateProductStatus(req.user.id, productIds, status);
    res.status(200).json(new ApiResponse(200, null, 'Bulk status update successful'));
});

const bulkDelete = asyncHandler(async (req, res) => {
    const { productIds } = req.body;
    await adminProductService.bulkDeleteProducts(req.user.id, productIds);
    res.status(200).json(new ApiResponse(200, null, 'Bulk deletion successful'));
});

const adjustInventory = asyncHandler(async (req, res) => {
    const { variantId, adjustment, reason } = req.body;
    const newStock = await adminProductService.adjustInventory(req.user.id, variantId, parseInt(adjustment), reason);
    res.status(200).json(new ApiResponse(200, { newStock }, 'Inventory adjusted successfully'));
});

module.exports = { bulkUpdateStatus, bulkDelete, adjustInventory };
