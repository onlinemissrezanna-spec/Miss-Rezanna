const { z } = require('zod');

const applyCouponSchema = z.object({
    body: z.object({
        code: z.string().min(3, 'Coupon code must be at least 3 characters')
    })
});

module.exports = { applyCouponSchema };
