const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/admin-dashboard.service');

const getDashboard = asyncHandler(async (req, res) => {
    const metrics = await dashboardService.getDashboardMetrics();
    res.status(200).json(new ApiResponse(200, metrics, 'Dashboard metrics retrieved'));
});

module.exports = { getDashboard };
