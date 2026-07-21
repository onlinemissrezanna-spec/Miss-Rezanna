const { z } = require('zod');

const updateProfileSchema = z.object({
    body: z.object({
        firstName: z.string().min(2, 'First name is required').optional(),
        lastName: z.string().min(2, 'Last name is required').optional(),
        phone: z.string().optional()
    })
});

module.exports = { updateProfileSchema };
