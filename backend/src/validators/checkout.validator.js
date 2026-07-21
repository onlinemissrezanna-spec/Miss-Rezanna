const { z } = require('zod');

const createCheckoutSchema = z.object({
    body: z.object({
        addressId: z.number().int().positive('Address ID is required'),
        shippingMethodId: z.number().int().positive('Shipping Method ID is required'),
        couponCode: z.string().optional()
    })
});

module.exports = { createCheckoutSchema };
