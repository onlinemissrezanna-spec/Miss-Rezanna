const prisma = require('../config/db');

const getDashboardMetrics = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Revenue aggregations
    const todayRevenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'Paid', paidAt: { gte: today } }
    });

    const weeklyRevenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'Paid', paidAt: { gte: firstDayOfWeek } }
    });

    const monthlyRevenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'Paid', paidAt: { gte: firstDayOfMonth } }
    });

    const totalRevenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'Paid' }
    });

    // Order Counts
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { orderStatus: 'Pending Confirmation' } });
    const processingOrders = await prisma.order.count({ where: { orderStatus: 'Processing' } });
    const shippedOrders = await prisma.order.count({ where: { orderStatus: 'Shipped' } });
    const deliveredOrders = await prisma.order.count({ where: { orderStatus: 'Delivered' } });
    const cancelledOrders = await prisma.order.count({ where: { orderStatus: 'Cancelled' } });

    // Inventory Alerts
    const outOfStockCount = await prisma.inventory.count({ where: { stock: 0 } });
    const lowStockCount = await prisma.inventory.count({ where: { stock: { gt: 0, lte: 5 } } });

    // Top Selling Products (Simple count of order items)
    const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    });

    // Fetch product details for top selling
    const topProductDetails = await Promise.all(
        topProducts.map(async (p) => {
            const product = await prisma.product.findUnique({ where: { id: p.productId }, select: { name: true, sku: true } });
            return {
                ...product,
                totalSold: p._sum.quantity
            };
        })
    );

    // Recent Orders
    const recentOrders = await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } }
    });

    return {
        revenue: {
            today: todayRevenueAgg._sum.amount || 0,
            weekly: weeklyRevenueAgg._sum.amount || 0,
            monthly: monthlyRevenueAgg._sum.amount || 0,
            total: totalRevenueAgg._sum.amount || 0
        },
        orders: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders
        },
        inventory: {
            outOfStock: outOfStockCount,
            lowStock: lowStockCount
        },
        topProducts: topProductDetails,
        recentOrders
    };
};

module.exports = { getDashboardMetrics };
