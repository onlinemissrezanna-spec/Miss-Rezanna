const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const productService = require('../services/product.service');

const createProduct = asyncHandler(async (req, res) => {
    const images = req.files || [];
    const product = await productService.createProduct(req.body, images);
    res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
});

const getProducts = asyncHandler(async (req, res) => {
    const result = await productService.getProducts(req.query, req.query);
    res.status(200).json(new ApiResponse(200, result, 'Products retrieved'));
});

const getProduct = asyncHandler(async (req, res) => {
    const product = await productService.getProductByIdOrSlug(req.params.identifier);
    res.status(200).json(new ApiResponse(200, product, 'Product retrieved'));
});

const updateProduct = asyncHandler(async (req, res) => {
    const images = req.files || [];
    const product = await productService.updateProduct(parseInt(req.params.id), req.body, images);
    res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
});

const deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(parseInt(req.params.id));
    res.status(200).json(new ApiResponse(200, null, 'Product archived successfully'));
});

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct };
