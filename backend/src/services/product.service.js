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
    const taxPercentage = data.taxPercentage !== undefined ? parseFloat(data.taxPercentage) : 0;

    // Handle size-wise stock breakdown map (S to 6XL)
    let sizeStockMap = { S: 10, M: 10, L: 10, XL: 10, '2XL': 5, '3XL': 5, '4XL': 2, '5XL': 2, '6XL': 2 };
    if (data.sizeStock) {
        try {
            sizeStockMap = typeof data.sizeStock === 'string' ? JSON.parse(data.sizeStock) : data.sizeStock;
        } catch (e) {}
    } else if (data.stock !== undefined) {
        const total = parseInt(data.stock);
        const perSize = Math.max(0, Math.floor(total / 9));
        sizeStockMap = { S: perSize, M: perSize, L: perSize, XL: perSize, '2XL': perSize, '3XL': perSize, '4XL': perSize, '5XL': perSize, '6XL': perSize };
    }

    const sizesToCreate = Object.keys(sizeStockMap);
    const variantsCreateArray = sizesToCreate.map(size => {
        const sQty = parseInt(sizeStockMap[size]) || 0;
        return {
            size,
            color: 'Standard',
            variantSku: `${sku}-${size}`,
            priceAdjustment: 0,
            inventory: {
                create: { stock: sQty, lowStockThreshold: 5 }
            }
        };
    });

    const newProduct = await prisma.product.create({
        data: {
            name: data.name,
            slug,
            sku,
            price,
            taxPercentage,
            description: data.description || '',
            seoTitle: data.seoTitle || null,
            seoDescription: data.seoDescription || null,
            seoKeywords: data.seoKeywords || null,
            brand: data.brand || null,
            fabric: data.fabric || null,
            fit: data.fit || null,
            careInstructions: data.careInstructions || null,
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
                create: variantsCreateArray
            }
        },
        include: { images: true, category: true, variants: { include: { inventory: true } } }
    });

    // Automatically send email announcement to all registered customers
    try {
        const { broadcastNewProductEmail } = require('./email.service');
        broadcastNewProductEmail(newProduct).catch(e => console.error('Broadcast notice:', e.message));
    } catch (e) {}

    return newProduct;
};

const MASTER_CATALOGUE = [
  {
    id: 1,
    name: 'Zuri Arch Embroidered Jacket & Trousers Co-ord Set - Noir Black',
    slug: 'black-embroidered-jacket-coord-set',
    sku: 'MR-SS-001',
    price: 2771,
    basePrice: 2771,
    originalPrice: 3695,
    discountPercentage: 25,
    category: { id: 1, name: 'Summer Co-ord Sets', slug: 'summer-coord-sets' },
    status: 'active',
    taxPercentage: 12,
    images: [{ imageUrl: 'images/black-embroidered-jacket-coord-set-1.jpg', isPrimary: true }],
    description: 'The Zuri 3-Piece Co-ord Set unites architectural grandeur with fluid summer ease in a commanding noir black palette.',
    seoTitle: 'Black Embroidered Jacket Co-ord Set for Women | Summer Edit — MISS REZANNA',
    seoDescription: 'Shop the noir black embroidered jacket co-ord set by MISS REZANNA. Features antique gold arch threadwork, inner top & wide-leg trousers. Enjoy 25% off.',
    focusKeyword: 'black embroidered jacket co-ord set',
    stock: 90,
    variants: [
      { size: 'S', inventory: { stock: 10 } },
      { size: 'M', inventory: { stock: 10 } },
      { size: 'L', inventory: { stock: 10 } },
      { size: 'XL', inventory: { stock: 10 } },
      { size: '2XL', inventory: { stock: 10 } },
      { size: '3XL', inventory: { stock: 10 } },
      { size: '4XL', inventory: { stock: 10 } },
      { size: '5XL', inventory: { stock: 10 } },
      { size: '6XL', inventory: { stock: 10 } }
    ]
  },
  {
    id: 2,
    name: 'Gulnar Rose Embroidered Linen Tunic Co-ord Set - Charcoal Slate',
    slug: 'charcoal-floral-embroidered-tunic-coord-set',
    sku: 'MR-SS-002',
    price: 2621,
    basePrice: 2621,
    originalPrice: 3495,
    discountPercentage: 25,
    category: { id: 1, name: 'Summer Co-ord Sets', slug: 'summer-coord-sets' },
    status: 'active',
    taxPercentage: 12,
    images: [{ imageUrl: 'images/charcoal-floral-embroidered-tunic-coord-set-1.jpg', isPrimary: true }],
    description: 'The Gulnar Co-ord Set features fine Kashmiri rosette embroidery down the front placket and across poet balloon sleeves in slub linen.',
    seoTitle: 'Charcoal Linen Floral Embroidered Co-ord Set | Summer Wear — MISS REZANNA',
    seoDescription: 'Buy charcoal slate linen-cotton co-ord set with rose pink floral embroidery & straight trousers. Handcrafted in Ludhiana for effortless summer grace. 25% off.',
    focusKeyword: 'charcoal linen floral co-ord set',
    stock: 90,
    variants: [
      { size: 'S', inventory: { stock: 10 } },
      { size: 'M', inventory: { stock: 10 } },
      { size: 'L', inventory: { stock: 10 } },
      { size: 'XL', inventory: { stock: 10 } },
      { size: '2XL', inventory: { stock: 10 } },
      { size: '3XL', inventory: { stock: 10 } },
      { size: '4XL', inventory: { stock: 10 } },
      { size: '5XL', inventory: { stock: 10 } },
      { size: '6XL', inventory: { stock: 10 } }
    ]
  },
  {
    id: 3,
    name: 'Vanya Botanical Embroidered Linen Shirt Co-ord Set - Sage Mint',
    slug: 'sage-green-embroidered-linen-coord-set',
    sku: 'MR-SS-003',
    price: 2400,
    basePrice: 2400,
    originalPrice: 3200,
    discountPercentage: 25,
    category: { id: 1, name: 'Summer Co-ord Sets', slug: 'summer-coord-sets' },
    status: 'active',
    taxPercentage: 12,
    images: [{ imageUrl: 'images/sage-green-embroidered-linen-coord-set-1.jpg', isPrimary: true }],
    description: 'The Vanya Co-ord Set is designed in refreshing sage mint hue with symmetrical Suzani-inspired botanical vines and peacock wheel medallions in 100% fine slub linen.',
    seoTitle: 'Sage Mint Green Embroidered Linen Co-ord Set for Women — MISS REZANNA',
    seoDescription: 'Explore our sage green linen shirt co-ord set with intricate botanical vine embroidery and tailored trousers. Summer comfort meets artisan luxury at 25% off.',
    focusKeyword: 'sage mint green linen co-ord set',
    stock: 90,
    variants: [
      { size: 'S', inventory: { stock: 10 } },
      { size: 'M', inventory: { stock: 10 } },
      { size: 'L', inventory: { stock: 10 } },
      { size: 'XL', inventory: { stock: 10 } },
      { size: '2XL', inventory: { stock: 10 } },
      { size: '3XL', inventory: { stock: 10 } },
      { size: '4XL', inventory: { stock: 10 } },
      { size: '5XL', inventory: { stock: 10 } },
      { size: '6XL', inventory: { stock: 10 } }
    ]
  },
  {
    id: 4,
    name: 'Padma Lotus Embroidered Summer Co-ord Set - Indigo Denim Blue',
    slug: 'denim-blue-lotus-embroidered-coord-set',
    sku: 'MR-SS-004',
    price: 1980,
    basePrice: 1980,
    originalPrice: 2640,
    discountPercentage: 25,
    category: { id: 1, name: 'Summer Co-ord Sets', slug: 'summer-coord-sets' },
    status: 'active',
    taxPercentage: 12,
    images: [{ imageUrl: 'images/denim-blue-lotus-embroidered-coord-set-1.jpg', isPrimary: true }],
    description: 'The Padma Co-ord Set redefines casual dressing with soft-washed slub chambray, lotus flower embroidery, and two deep functional side pockets.',
    seoTitle: 'Indigo Denim Blue Lotus Embroidered Co-ord Set for Women — MISS REZANNA',
    seoDescription: 'Shop indigo denim blue summer co-ord set with lotus threadwork & functional side pockets. Light, stylish everyday luxury at ₹1,980 (25% off). Fast shipping.',
    focusKeyword: 'indigo denim lotus co-ord set',
    stock: 90,
    variants: [
      { size: 'S', inventory: { stock: 10 } },
      { size: 'M', inventory: { stock: 10 } },
      { size: 'L', inventory: { stock: 10 } },
      { size: 'XL', inventory: { stock: 10 } },
      { size: '2XL', inventory: { stock: 10 } },
      { size: '3XL', inventory: { stock: 10 } },
      { size: '4XL', inventory: { stock: 10 } },
      { size: '5XL', inventory: { stock: 10 } },
      { size: '6XL', inventory: { stock: 10 } }
    ]
  },
  {
    id: 5,
    name: 'Mehrab Floral Embroidered Luxury Co-ord Set - Ocean Teal',
    slug: 'ocean-teal-floral-embroidered-coord-set',
    sku: 'MR-SS-005',
    price: 3071,
    basePrice: 3071,
    originalPrice: 4095,
    discountPercentage: 25,
    category: { id: 1, name: 'Summer Co-ord Sets', slug: 'summer-coord-sets' },
    status: 'active',
    taxPercentage: 12,
    images: [{ imageUrl: 'images/ocean-teal-floral-embroidered-coord-set-1.jpg', isPrimary: true }],
    description: 'The Mehrab Co-ord Set features architectural Mughal floral border panels wrapping around shirt placket, side seams, cuffs, and trouser hem in pure cotton-linen.',
    seoTitle: 'Ocean Teal Floral Embroidered Luxury Co-ord Set — MISS REZANNA',
    seoDescription: 'Discover our ocean teal blue luxury co-ord set with architectural floral embroidery on tunic & matching trousers. Premium summer couture at 25% off.',
    focusKeyword: 'ocean teal floral luxury co-ord set',
    stock: 90,
    variants: [
      { size: 'S', inventory: { stock: 10 } },
      { size: 'M', inventory: { stock: 10 } },
      { size: 'L', inventory: { stock: 10 } },
      { size: 'XL', inventory: { stock: 10 } },
      { size: '2XL', inventory: { stock: 10 } },
      { size: '3XL', inventory: { stock: 10 } },
      { size: '4XL', inventory: { stock: 10 } },
      { size: '5XL', inventory: { stock: 10 } },
      { size: '6XL', inventory: { stock: 10 } }
    ]
  },
  {
    id: 6,
    name: 'Navy Blue Floral Embroidered Kurta Pant Set',
    slug: 'navy-blue-embroidered-kurta-pant-set',
    sku: 'MR-KS-013',
    price: 2360,
    basePrice: 2360,
    originalPrice: 2950,
    discountPercentage: 20,
    category: { id: 2, name: 'Kurta Pant Sets', slug: 'kurta-pant-sets' },
    status: 'active',
    taxPercentage: 12,
    images: [
      { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-1.png', isPrimary: true },
      { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-2.png', isPrimary: false },
      { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-3.png', isPrimary: false }
    ],
    description: 'A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.',
    seoTitle: 'Navy Blue Embroidered Kurta Pant Set for Women | MISS REZANNA',
    seoDescription: 'Shop the navy blue embroidered kurta pant set by MISS REZANNA, featuring intricate floral embroidery and a sophisticated contemporary silhouette.',
    focusKeyword: 'navy blue embroidered kurta pant set',
    stock: 90,
    variants: [
      { size: 'S', inventory: { stock: 10 } },
      { size: 'M', inventory: { stock: 10 } },
      { size: 'L', inventory: { stock: 10 } },
      { size: 'XL', inventory: { stock: 10 } },
      { size: '2XL', inventory: { stock: 10 } },
      { size: '3XL', inventory: { stock: 10 } },
      { size: '4XL', inventory: { stock: 10 } },
      { size: '5XL', inventory: { stock: 10 } },
      { size: '6XL', inventory: { stock: 10 } }
    ]
  }
];

const getProducts = async (filters, queryParams = {}) => {
    const { page = 1, limit = 50, sort = '-createdAt', category, minPrice, maxPrice, status, isFeatured, search } = queryParams;
    const skip = (page - 1) * limit;

    try {
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
                include: { images: true, category: { select: { name: true, slug: true } }, variants: { include: { inventory: true } } }
            })
        ]);

        if (total > 0) {
            return {
                products,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit),
                    limit: parseInt(limit)
                }
            };
        }
    } catch (e) {
        console.warn('Prisma getProducts fallback:', e.message);
    }

    let prods = MASTER_CATALOGUE;
    if (category) {
        prods = prods.filter(p => p.category?.slug === category);
    }
    const paginated = prods.slice(skip, skip + parseInt(limit));

    return {
        products: paginated,
        pagination: {
            total: prods.length,
            page: parseInt(page),
            pages: Math.ceil(prods.length / limit),
            limit: parseInt(limit)
        }
    };
};

const getProductByIdOrSlug = async (identifier) => {
    const isId = !isNaN(identifier) && !identifier.includes('-');
    try {
        const product = await prisma.product.findFirst({
            where: isId ? { id: parseInt(identifier) } : { slug: identifier },
            include: {
                images: true,
                category: true,
                variants: { include: { inventory: true } }
            }
        });

        if (product) return product;
    } catch (e) {
        console.warn('Prisma getProductByIdOrSlug fallback:', e.message);
    }

    const fallback = MASTER_CATALOGUE.find(p => isId ? p.id === parseInt(identifier) : p.slug === identifier);
    if (fallback) return fallback;

    throw new ApiError(404, 'Product not found');
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
    if (data.taxPercentage !== undefined) updateData.taxPercentage = parseFloat(data.taxPercentage);
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.fabric !== undefined) updateData.fabric = data.fabric;
    if (data.fit !== undefined) updateData.fit = data.fit;
    if (data.careInstructions !== undefined) updateData.careInstructions = data.careInstructions;
    if (data.slug !== undefined && data.slug.trim()) updateData.slug = data.slug.trim();

    let imageList = [];
    if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach(img => {
            let p = img.path || img.filename || img;
            if (typeof p === 'string') p = p.replace(/\\/g, '/');
            imageList.push(p);
        });
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
        include: { images: true, category: true, variants: { include: { inventory: true } } }
    });

    if (data.sizeStock !== undefined) {
        let sizeStockMap = {};
        try {
            sizeStockMap = typeof data.sizeStock === 'string' ? JSON.parse(data.sizeStock) : data.sizeStock;
        } catch (e) {}

        for (let [sizeName, qty] of Object.entries(sizeStockMap)) {
            const stockNum = parseInt(qty) || 0;
            let variant = await prisma.productVariant.findFirst({
                where: { productId: id, size: sizeName }
            });
            if (!variant) {
                variant = await prisma.productVariant.create({
                    data: {
                        productId: id,
                        size: sizeName,
                        color: 'Standard',
                        variantSku: `${updatedProduct.sku}-${sizeName}`,
                        inventory: { create: { stock: stockNum } }
                    }
                });
            } else {
                await prisma.inventory.upsert({
                    where: { variantId: variant.id },
                    update: { stock: stockNum },
                    create: { variantId: variant.id, stock: stockNum }
                });
            }
        }
    } else if (data.stock !== undefined) {
        const stock = parseInt(data.stock);
        const variants = await prisma.productVariant.findMany({ where: { productId: id } });
        for (let v of variants) {
            await prisma.inventory.upsert({
                where: { variantId: v.id },
                update: { stock },
                create: { variantId: v.id, stock }
            });
        }
    }

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
