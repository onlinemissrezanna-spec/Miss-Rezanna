const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const orderService = require('../services/order.service');

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getMyOrders(req.user.id);
    res.status(200).json(new ApiResponse(200, orders, 'Orders retrieved'));
});

const getOrder = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role && req.user.role.name === 'Admin';
    const order = await orderService.getOrderById(req.user.id, parseInt(req.params.id), isAdmin);
    res.status(200).json(new ApiResponse(200, order, 'Order retrieved'));
});

// Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const { page, limit, status } = req.query;
    const result = await orderService.getAllOrders(page, limit, status);
    res.status(200).json(new ApiResponse(200, result, 'All orders retrieved'));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, paymentStatus } = req.body;
    const order = await orderService.updateOrderStatus(parseInt(req.params.id), status, paymentStatus);
    res.status(200).json(new ApiResponse(200, order, 'Order updated'));
});

module.exports = { getMyOrders, getOrder, getAllOrders, updateOrderStatus };
