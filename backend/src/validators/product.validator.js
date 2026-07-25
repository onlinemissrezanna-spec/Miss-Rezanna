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
        salePrice: z.preprocess((a) => (typeof a === 'number' ? a : (a ? parseFloat(String(a)) : undefined)), z.number().positive().optional()),
        costPrice: z.preprocess((a) => (typeof a === 'number' ? a : (a ? parseFloat(String(a)) : undefined)), z.number().positive().optional()),
        taxPercentage: z.preprocess((a) => (typeof a === 'number' ? a : (a !== undefined && a !== '' ? parseFloat(String(a)) : undefined)), z.number().min(0).optional()),
        stock: z.preprocess((a) => (typeof a === 'number' ? a : (a !== undefined && a !== '' ? parseInt(String(a), 10) : undefined)), z.number().int().min(0).optional()),
        status: z.string().optional(),
        isFeatured: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        isNewArrival: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        isBestSeller: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        youtubeUrl: z.string().optional().nullable(),
        imageUrls: z.any().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional(),
        focusKeyword: z.string().optional(),
        secondaryKeywords: z.string().optional(),
        canonicalUrl: z.string().optional(),
        robotsMeta: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
        twitterTitle: z.string().optional(),
        twitterDescription: z.string().optional(),
        twitterImage: z.string().optional(),
        subCategory: z.string().optional(),
        tags: z.any().optional(),
        barcode: z.string().optional(),
        compareAtPrice: z.preprocess((a) => (a ? parseFloat(String(a)) : undefined), z.number().optional()),
        stockStatus: z.string().optional(),
        weight: z.string().optional(),
        dimensions: z.string().optional(),
        shippingDetails: z.string().optional(),
        collections: z.string().optional(),
        relatedProducts: z.string().optional(),
        faqs: z.any().optional(),
        highlights: z.string().optional(),
        keyFeatures: z.string().optional(),
        sizeGuide: z.string().optional(),
        stylingTips: z.string().optional(),
        returnInfo: z.string().optional(),
        publishSchedule: z.string().optional(),
        sitemapInclusion: z.preprocess((a) => a === true || a === 'true', z.boolean().optional()),
        variants: z.any().optional()
    }).passthrough()
});

const updateProductSchema = z.object({
    body: z.object({
        categoryId: z.preprocess((a) => (typeof a === 'number' ? a : (a ? parseInt(String(a), 10) : undefined)), z.number().int().positive().optional()),
        name: z.string().min(3).optional(),
        price: z.preprocess((a) => (typeof a === 'number' ? a : (a ? parseFloat(String(a)) : undefined)), z.number().positive().optional()),
        taxPercentage: z.preprocess((a) => (typeof a === 'number' ? a : (a !== undefined && a !== '' ? parseFloat(String(a)) : undefined)), z.number().min(0).optional()),
        stock: z.preprocess((a) => (typeof a === 'number' ? a : (a !== undefined && a !== '' ? parseInt(String(a), 10) : undefined)), z.number().int().min(0).optional()),
        status: z.string().optional()
    }).passthrough()
});

module.exports = { createProductSchema, updateProductSchema };
