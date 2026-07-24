const { z } = require('zod');

const createProductSchema = z.object({
    body: z.object({
        categoryId: z.preprocess((a) => (a ? parseInt(String(a), 10) : undefined), z.number().int().positive().optional()),
        name: z.string().min(3, 'Product name must be at least 3 characters'),
        shortDescription: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().min(3, 'SKU must be at least 3 characters'),
        brand: z.string().optional(),
        fabric: z.string().optional(),
        fit: z.string().optional(),
        careInstructions: z.string().optional(),
        price: z.preprocess((a) => (typeof a === 'number' ? a : (a ? parseFloat(String(a)) : undefined)), z.number().positive('Price must be greater than 0')),
        salePrice: z.preprocess((a) => (a ? parseFloat(String(a)) : undefined), z.number().positive().optional()),
        costPrice: z.preprocess((a) => (a ? parseFloat(String(a)) : undefined), z.number().positive().optional()),
        taxPercentage: z.preprocess((a) => (a ? parseFloat(String(a)) : undefined), z.number().min(0).optional()),
        status: z.enum(['active', 'draft', 'archived']).optional(),
        isFeatured: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        isNewArrival: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        isBestSeller: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        youtubeUrl: z.string().optional().nullable(),
        imageUrls: z.array(z.string()).optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        variants: z.any().optional(),
        tags: z.any().optional()
    }).passthrough()
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
