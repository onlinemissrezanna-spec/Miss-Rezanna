const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const settingsService = require('../services/admin-settings.service');

const getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();
    res.status(200).json(new ApiResponse(200, settings, 'Settings retrieved'));
});

const updateSetting = asyncHandler(async (req, res) => {
    const { key, value } = req.body;
    const setting = await settingsService.updateSetting(req.user.id, key, value);
    res.status(200).json(new ApiResponse(200, setting, 'Setting updated successfully'));
});

module.exports = { getSettings, updateSetting };
