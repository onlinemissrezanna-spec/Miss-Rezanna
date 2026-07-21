const { z } = require('zod');

const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name is required'),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional()
    })
});

const updateCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name is required').optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().int().optional()
    })
});

module.exports = { createCategorySchema, updateCategorySchema };
