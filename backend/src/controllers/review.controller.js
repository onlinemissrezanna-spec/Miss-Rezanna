const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const reviewService = require('../services/review.service');

const createReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment } = req.body;
    const review = await reviewService.createReview(req.user.id, productId, rating, comment);
    res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page, limit } = req.query;
    const data = await reviewService.getProductReviews(parseInt(productId), parseInt(page), parseInt(limit));
    res.status(200).json(new ApiResponse(200, data, 'Reviews retrieved'));
});

module.exports = { createReview, getProductReviews };
