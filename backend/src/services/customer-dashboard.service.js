const prisma = require('../config/db');

const getDashboardData = async (userId) => {
    // Basic User info
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true, phone: true }
    });

    const isProfileComplete = !!(user.firstName && user.lastName && user.phone);

    // Counts
    const cart = await prisma.cart.findUnique({ where: { userId }, include: { _count: { select: { items: true } } } });
    const cartCount = cart ? cart._count.items : 0;

    const wishlist = await prisma.wishlist.findUnique({ where: { userId }, include: { _count: { select: { items: true } } } });
    const wishlistCount = wishlist ? wishlist._count.items : 0;

    const savedAddressesCount = await prisma.address.count({ where: { userId } });

    // Orders Funnel
    const pendingOrders = await prisma.order.count({ where: { userId, orderStatus: { in: ['Pending Confirmation', 'Processing', 'Packed', 'Shipped', 'Out For Delivery'] } } });
    const deliveredOrders = await prisma.order.count({ where: { userId, orderStatus: 'Delivered' } });
    const cancelledOrders = await prisma.order.count({ where: { userId, orderStatus: 'Cancelled' } });
    
    const recentOrders = await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { items: { include: { product: { select: { name: true, images: { take: 1 } } } } } }
    });

    // Returns
    const returnRequestsCount = await prisma.returnRequest.count({ where: { userId } });

    // Notifications
    const unreadNotificationsCount = await prisma.customerNotification.count({ where: { userId, isRead: false } });
    const recentNotifications = await prisma.customerNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return {
        profile: {
            ...user,
            isProfileComplete,
            rewardPoints: 0, // Future readiness
            walletBalance: 0 // Future readiness
        },
        counts: {
            cart: cartCount,
            wishlist: wishlistCount,
            addresses: savedAddressesCount,
            returns: returnRequestsCount
        },
        orders: {
            pending: pendingOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
            recent: recentOrders
        },
        notifications: {
            unreadCount: unreadNotificationsCount,
            recent: recentNotifications
        }
    };
};

module.exports = { getDashboardData };
