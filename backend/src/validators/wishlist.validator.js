const { z } = require('zod');

const addToWishlistSchema = z.object({
    body: z.object({
        productId: z.number().int().positive('Product ID is required'),
        variantId: z.number().int().positive().optional()
    })
});

module.exports = { addToWishlistSchema };
