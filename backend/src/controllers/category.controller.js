const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');

const createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getCategories();
    res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved'));
});

const getCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryByIdOrSlug(req.params.identifier);
    res.status(200).json(new ApiResponse(200, category, 'Category retrieved'));
});

const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(parseInt(req.params.id), req.body);
    res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(parseInt(req.params.id));
    res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});

module.exports = { createCategory, getCategories, getCategory, updateCategory, deleteCategory };
