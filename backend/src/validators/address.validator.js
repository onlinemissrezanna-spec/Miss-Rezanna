const { z } = require('zod');

const createAddressSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name is required'),
        phone: z.string().min(10, 'Phone is required'),
        email: z.string().email('Valid email is required').optional(),
        addressLine1: z.string().min(5, 'Address Line 1 is required'),
        addressLine2: z.string().optional(),
        landmark: z.string().optional(),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        country: z.string().min(2, 'Country is required'),
        postalCode: z.string().min(4, 'Postal Code is required'),
        addressType: z.enum(['Home', 'Office', 'Other']).optional(),
        isDefault: z.boolean().optional()
    })
});

const updateAddressSchema = z.object({
    body: createAddressSchema.shape.body.partial()
});

module.exports = { createAddressSchema, updateAddressSchema };
