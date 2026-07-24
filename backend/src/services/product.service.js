const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');

const createProduct = async (data, uploadedImages = []) => {
    let categoryId = data.categoryId ? parseInt(data.categoryId) : null;
    if (!categoryId) {
        let cat = await prisma.category.findFirst();
        if (!cat) {
            cat = await prisma.category.create({
                data: { name: 'General Collection', slug: 'general-collection' }
            });
        }
        categoryId = cat.id;
    }

    let slug = slugify(data.name || 'product');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    let imageList = [];
    if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach(img => imageList.push(img.path || img.filename || img));
    }
    if (data.imageUrls) {
        const urls = Array.isArray(data.imageUrls) ? data.imageUrls : (typeof data.imageUrls === 'string' ? JSON.parse(data.imageUrls) : []);
        urls.forEach(u => { if (u && u.trim()) imageList.push(u.trim()); });
    }
    if (imageList.length === 0) {
        imageList = ['images/A.jpeg'];
    }

    const price = parseFloat(data.price || 0);
    const sku = data.sku || `SKU-${Date.now()}`;

    const newProduct = await prisma.product.create({
        data: {
            name: data.name,
            slug,
            sku,
            price,
            description: data.description || '',
            shortDescription: data.shortDescription || '',
            youtubeUrl: data.youtubeUrl || null,
            categoryId,
            status: data.status || 'active',
            isFeatured: data.isFeatured === true || data.isFeatured === 'true',
            isNewArrival: data.isNewArrival === true || data.isNewArrival === 'true',
            images: {
                create: imageList.map((url, i) => ({
                    imageUrl: url,
                    isPrimary: i === 0,
                    sortOrder: i
                }))
            },
            variants: {
                create: ['XS', 'S', 'M', 'L', 'XL'].map(size => ({
                    size,
                    color: 'Standard',
                    variantSku: `${sku}-${size}`,
                    priceAdjustment: 0,
                    inventory: {
                        create: { stock: 50, lowStockThreshold: 5 }
                    }
                }))
            }
        },
        include: { images: true, category: true, variants: true }
    });

    return newProduct;
};

const getProducts = async (filters, queryParams = {}) => {
    const { page = 1, limit = 50, sort = '-createdAt', category, minPrice, maxPrice, status, isFeatured, search } = queryParams;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    
    if (category) where.category = { slug: category };
    if (isFeatured) where.isFeatured = true;
    
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice);
        if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { description: { contains: search } },
            { sku: { contains: search } }
        ];
    }

    let orderBy = {};
    if (sort.startsWith('-')) {
        orderBy[sort.substring(1)] = 'desc';
    } else {
        orderBy[sort] = 'asc';
    }

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy,
            include: { images: true, category: { select: { name: true, slug: true } } }
        })
    ]);

    return {
        products,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
        }
    };
};

const getProductByIdOrSlug = async (identifier) => {
    const isId = !isNaN(identifier) && !identifier.includes('-');
    const product = await prisma.product.findFirst({
        where: isId ? { id: parseInt(identifier) } : { slug: identifier },
        include: {
            images: true,
            category: true,
            variants: { include: { inventory: true } }
        }
    });

    if(!product) throw new ApiError(404, 'Product not found');
    return product;
};

const updateProduct = async (id, data, uploadedImages = []) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new ApiError(404, 'Product not found');

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.sku) updateData.sku = data.sku;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = data.youtubeUrl;
    if (data.status) updateData.status = data.status;
    if (data.categoryId) updateData.categoryId = parseInt(data.categoryId);

    let imageList = [];
    if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach(img => imageList.push(img.path || img.filename || img));
    }
    if (data.imageUrls !== undefined) {
        const urls = Array.isArray(data.imageUrls) ? data.imageUrls : (typeof data.imageUrls === 'string' ? JSON.parse(data.imageUrls) : []);
        urls.forEach(u => { if (u && u.trim()) imageList.push(u.trim()); });
    }

    if (imageList.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        updateData.images = {
            create: imageList.map((url, i) => ({
                imageUrl: url,
                isPrimary: i === 0,
                sortOrder: i
            }))
        };
    }

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { images: true, category: true }
    });

    return updatedProduct;
};

const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if(!product) throw new ApiError(404, 'Product not found');
    
    try {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });
    } catch (e) {
        await prisma.product.update({
            where: { id },
            data: { status: 'archived' }
        });
    }
    return true;
};

module.exports = { createProduct, getProducts, getProductByIdOrSlug, updateProduct, deleteProduct };
