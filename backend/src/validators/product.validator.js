const { z } = require('zod');

const createProductSchema = z.object({
    body: z.object({
        categoryId: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().positive()),
        name: z.string().min(3, 'Product name must be at least 3 characters'),
        shortDescription: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().min(3, 'SKU must be at least 3 characters'),
        brand: z.string().optional(),
        fabric: z.string().optional(),
        fit: z.string().optional(),
        careInstructions: z.string().optional(),
        price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive('Price must be greater than 0')),
        salePrice: z.preprocess((a) => (a ? parseFloat(z.string().parse(a)) : undefined), z.number().positive().optional()),
        costPrice: z.preprocess((a) => (a ? parseFloat(z.string().parse(a)) : undefined), z.number().positive().optional()),
        taxPercentage: z.preprocess((a) => (a ? parseFloat(z.string().parse(a)) : undefined), z.number().min(0).optional()),
        status: z.enum(['active', 'draft', 'archived']).optional(),
        isFeatured: z.preprocess((a) => a === 'true', z.boolean().optional()),
        isNewArrival: z.preprocess((a) => a === 'true', z.boolean().optional()),
        isBestSeller: z.preprocess((a) => a === 'true', z.boolean().optional()),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        // Variants and tags passed as JSON strings if multipart/form-data
        variants: z.string().optional().transform((val) => val ? JSON.parse(val) : []),
        tags: z.string().optional().transform((val) => val ? JSON.parse(val) : [])
    })
});

const updateProductSchema = z.object({
    body: z.object({
        categoryId: z.preprocess((a) => (a ? parseInt(z.string().parse(a), 10) : undefined), z.number().int().positive().optional()),
        name: z.string().min(3).optional(),
        price: z.preprocess((a) => (a ? parseFloat(z.string().parse(a)) : undefined), z.number().positive().optional()),
        // Other fields omitted for brevity, logic identical to create schema but optional
        status: z.enum(['active', 'draft', 'archived']).optional()
    }).passthrough()
});

module.exports = { createProductSchema, updateProductSchema };
