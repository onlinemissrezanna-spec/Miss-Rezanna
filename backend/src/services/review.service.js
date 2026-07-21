const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const createReview = async (userId, productId, rating, comment) => {
    // Check if user has purchased the product
    const orderItem = await prisma.orderItem.findFirst({
        where: {
            productId,
            order: { userId, orderStatus: 'Delivered' }
        }
    });

    if (!orderItem) throw new ApiError(403, 'You can only review products you have purchased and received.');

    const existingReview = await prisma.review.findFirst({
        where: { userId, productId }
    });

    if (existingReview) throw new ApiError(400, 'You have already reviewed this product.');

    const review = await prisma.review.create({
        data: { userId, productId, rating, comment, status: 'Approved' } // Auto-approve for now
    });

    // Update product average rating (optimistic approach)
    // A robust system might do this via a scheduled job or Prisma middleware.
    
    return review;
};

const getProductReviews = async (productId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const reviews = await prisma.review.findMany({
        where: { productId, status: 'Approved' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } }
    });

    const total = await prisma.review.count({ where: { productId, status: 'Approved' } });
    
    return { reviews, total, pages: Math.ceil(total / limit) };
};

module.exports = { createReview, getProductReviews };
