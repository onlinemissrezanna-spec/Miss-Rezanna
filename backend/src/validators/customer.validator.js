const { z } = require('zod');

const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
        lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
        phone: z.string().optional()
    })
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(6, 'Current password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters')
    })
});

const returnRequestSchema = z.object({
    body: z.object({
        orderId: z.number().int().positive('Valid Order ID required'),
        orderItemId: z.number().int().positive('Valid Order Item ID required'),
        reason: z.enum([
            'Wrong Size', 
            'Damaged Product', 
            'Wrong Product', 
            'Quality Issue', 
            'Changed Mind', 
            'Other'
        ]),
        notes: z.string().optional()
    })
});

const cancelOrderSchema = z.object({
    body: z.object({
        reason: z.string().min(3, 'Please provide a cancellation reason')
    })
});

module.exports = { updateProfileSchema, changePasswordSchema, returnRequestSchema, cancelOrderSchema };
