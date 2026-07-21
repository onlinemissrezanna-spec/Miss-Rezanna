const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { slugify } = require('../utils/slugify');

const buildProductData = async (data, images) => {
    const { categoryId, variants, tags, ...productData } = data;
    
    // Slug generation
    if (data.name) {
        let slug = slugify(data.name);
        const existing = await prisma.product.findUnique({ where: { slug } });
        if(existing) slug = `${slug}-${Date.now()}`;
        productData.slug = slug;
    }

    const prismaData = {
        ...productData,
        categoryId,
        images: {
            create: images.map((img, i) => ({
                imageUrl: img.path,
                isPrimary: i === 0,
                sortOrder: i
            }))
        }
    };

    if (variants && variants.length > 0) {
        prismaData.variants = {
            create: variants.map(v => ({
                size: v.size,
                color: v.color,
                variantSku: v.variantSku,
                priceAdjustment: v.priceAdjustment || 0,
                inventory: {
                    create: { stock: v.stock || 0 }
                }
            }))
        };
    }

    if (tags && tags.length > 0) {
        prismaData.tags = {
            connectOrCreate: tags.map(tag => ({
                where: { name: tag },
                create: { name: tag }
            }))
        };
    }

    return prismaData;
};

const createProduct = async (data, images = []) => {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if(!category) throw new ApiError(400, 'Invalid category ID');

    const prismaData = await buildProductData(data, images);
    
    return await prisma.product.create({
        data: prismaData,
        include: { images: true, variants: { include: { inventory: true } }, tags: true }
    });
};

const getProducts = async (filters, queryParams) => {
    const { page = 1, limit = 10, sort = '-createdAt', category, minPrice, maxPrice, status, isFeatured, search } = queryParams;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    else where.status = 'active'; // Default public view
    
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

    // Sorting
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
            variants: { include: { inventory: true } },
            tags: true,
            attributes: true
        }
    });

    if(!product) throw new ApiError(404, 'Product not found');
    return product;
};

const updateProduct = async (id, data, images = []) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if(!product) throw new ApiError(404, 'Product not found');

    const updateData = await buildProductData(data, []);
    
    if(images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        updateData.images = {
            create: images.map((img, i) => ({
                imageUrl: img.path,
                isPrimary: i === 0,
                sortOrder: i
            }))
        };
    }

    // Simple update logic, deleting existing variants/tags is omitted here for brevity 
    // but in a real app would require proper diffing. We just update primitive fields.
    delete updateData.variants;
    delete updateData.tags;

    return await prisma.product.update({
        where: { id },
        data: updateData,
        include: { images: true }
    });
};

const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if(!product) throw new ApiError(404, 'Product not found');
    
    // Soft delete strategy
    await prisma.product.update({
        where: { id },
        data: { status: 'archived' }
    });
    return true;
};

module.exports = { createProduct, getProducts, getProductByIdOrSlug, updateProduct, deleteProduct };
