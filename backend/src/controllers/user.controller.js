const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const getMe = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json(new ApiResponse(200, user, 'Profile retrieved successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
    const photoPath = req.file ? req.file.path : null;
    const user = await userService.updateProfile(req.user.id, req.body, photoPath);
    res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

module.exports = { getMe, updateProfile };
