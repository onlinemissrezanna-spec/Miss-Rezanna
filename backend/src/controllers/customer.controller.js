const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const dashboardService = require('../services/customer-dashboard.service');
const profileService = require('../services/customer-profile.service');
const orderService = require('../services/customer-order.service');
const notificationService = require('../services/customer-notification.service');

// Dashboard
const getDashboard = asyncHandler(async (req, res) => {
    const data = await dashboardService.getDashboardData(req.user.id);
    res.status(200).json(new ApiResponse(200, data, 'Dashboard retrieved'));
});

// Profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await profileService.updateProfile(req.user.id, req.body, req.ip);
    res.status(200).json(new ApiResponse(200, user, 'Profile updated'));
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await profileService.changePassword(req.user.id, currentPassword, newPassword, req.ip);
    res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

const deleteAccountRequest = asyncHandler(async (req, res) => {
    await profileService.deleteAccountRequest(req.user.id, req.ip);
    res.status(200).json(new ApiResponse(200, null, 'Account deletion requested'));
});

// Orders & Tracking
const trackOrder = asyncHandler(async (req, res) => {
    const timeline = await orderService.getTrackingTimeline(parseInt(req.params.id), req.user.id);
    res.status(200).json(new ApiResponse(200, timeline, 'Tracking timeline retrieved'));
});

const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    await orderService.cancelOrder(parseInt(req.params.id), req.user.id, reason, req.ip);
    res.status(200).json(new ApiResponse(200, null, 'Order cancelled successfully'));
});

const createReturnRequest = asyncHandler(async (req, res) => {
    const { orderId, orderItemId, reason, notes } = req.body;
    const request = await orderService.createReturnRequest(req.user.id, orderId, orderItemId, reason, notes, req.ip);
    res.status(201).json(new ApiResponse(201, request, 'Return request submitted'));
});

// Notifications
const getNotifications = asyncHandler(async (req, res) => {
    const notes = await notificationService.getNotifications(req.user.id);
    res.status(200).json(new ApiResponse(200, notes, 'Notifications retrieved'));
});

const markNotificationRead = asyncHandler(async (req, res) => {
    await notificationService.markAsRead(req.user.id, parseInt(req.params.id));
    res.status(200).json(new ApiResponse(200, null, 'Notification marked as read'));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

module.exports = { 
    getDashboard, updateProfile, changePassword, deleteAccountRequest, 
    trackOrder, cancelOrder, createReturnRequest,
    getNotifications, markNotificationRead, markAllNotificationsRead
};
