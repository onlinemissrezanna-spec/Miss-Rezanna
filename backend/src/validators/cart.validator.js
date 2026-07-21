const { z } = require('zod');

const addToCartSchema = z.object({
    body: z.object({
        productId: z.number().int().positive('Product ID is required'),
        variantId: z.number().int().positive().optional(),
        quantity: z.number().int().positive('Quantity must be greater than 0').default(1),
        guestToken: z.string().optional()
    })
});

const updateCartQuantitySchema = z.object({
    body: z.object({
        quantity: z.number().int().nonnegative('Quantity cannot be negative'),
        guestToken: z.string().optional()
    })
});

const guestTokenHeaderSchema = z.object({
    headers: z.object({
        'x-guest-token': z.string().optional()
    }).passthrough()
});

module.exports = { addToCartSchema, updateCartQuantitySchema, guestTokenHeaderSchema };
