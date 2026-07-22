const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    res.status(201).json(new ApiResponse(201, user, 'Registration successful. Please check your email to verify.'));
});

const verifyEmail = asyncHandler(async (req, res) => {
    await authService.verifyEmail(req.query.token);
    res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    res.status(200).json(new ApiResponse(200, data, 'Login successful'));
});

const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const data = await authService.refresh(refreshToken);
    res.status(200).json(new ApiResponse(200, data, 'Token refreshed successfully'));
});

const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.status(200).json(new ApiResponse(200, null, 'If that email is registered, a reset link has been sent.'));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully'));
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = { register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword, changePassword };
