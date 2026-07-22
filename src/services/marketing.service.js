const prisma = require('../config/db');

const getRecommendedProducts = async (userId, limit = 10) => {
    // Enterprise Strategy: If user is logged in, find products bought by others who bought what this user bought.
    // Fallback: Return trending/new products.
    
    const trending = await prisma.product.findMany({
        where: { status: 'Active' },
        take: limit,
        orderBy: { createdAt: 'desc' }
    });

    return trending;
};

const getFrequentlyBoughtTogether = async (productId, limit = 4) => {
    // Advanced Query: Find orders containing THIS product, then count OTHER products in those orders.
    // As a Prisma simplification without writing raw SQL:
    const relatedOrders = await prisma.orderItem.findMany({
        where: { productId },
        select: { orderId: true }
    });

    const orderIds = relatedOrders.map(ro => ro.orderId);

    const frequentItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { orderId: { in: orderIds }, productId: { not: productId } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: limit
    });

    const pIds = frequentItems.map(item => item.productId);

    const products = await prisma.product.findMany({
        where: { id: { in: pIds }, status: 'Active' },
        include: { images: { take: 1 } }
    });

    return products;
};

module.exports = { getRecommendedProducts, getFrequentlyBoughtTogether };
