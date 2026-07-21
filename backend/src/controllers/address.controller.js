const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const addressService = require('../services/address.service');

const createAddress = asyncHandler(async (req, res) => {
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json(new ApiResponse(201, address, 'Address saved'));
});

const getAddresses = asyncHandler(async (req, res) => {
    const addresses = await addressService.getAddresses(req.user.id);
    res.status(200).json(new ApiResponse(200, addresses, 'Addresses retrieved'));
});

const getAddress = asyncHandler(async (req, res) => {
    const address = await addressService.getAddressById(req.user.id, parseInt(req.params.id));
    res.status(200).json(new ApiResponse(200, address, 'Address retrieved'));
});

const updateAddress = asyncHandler(async (req, res) => {
    const address = await addressService.updateAddress(req.user.id, parseInt(req.params.id), req.body);
    res.status(200).json(new ApiResponse(200, address, 'Address updated'));
});

const deleteAddress = asyncHandler(async (req, res) => {
    await addressService.deleteAddress(req.user.id, parseInt(req.params.id));
    res.status(200).json(new ApiResponse(200, null, 'Address deleted'));
});

const setDefaultAddress = asyncHandler(async (req, res) => {
    const address = await addressService.setDefaultAddress(req.user.id, parseInt(req.params.id));
    res.status(200).json(new ApiResponse(200, address, 'Default address updated'));
});

module.exports = { createAddress, getAddresses, getAddress, updateAddress, deleteAddress, setDefaultAddress };
