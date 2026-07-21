const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const getMyOrders = async (userId) => {
    return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            items: { include: { product: { select: { name: true, images: { take: 1, where: { isPrimary: true } } } }, variant: true } },
            shippingMethod: true
        }
    });
};

const getOrderById = async (userId, id, isAdmin = false) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: { include: { product: { select: { name: true, images: { take: 1 } } }, variant: true } },
            shippingAddress: true,
            shippingMethod: true,
            coupon: true,
            user: { select: { firstName: true, lastName: true, email: true } }
        }
    });

    if (!order) throw new ApiError(404, 'Order not found');
    if (!isAdmin && order.userId !== userId) throw new ApiError(403, 'Access denied');

    return order;
};

// Admin
const getAllOrders = async (page = 1, limit = 10, status) => {
    const skip = (page - 1) * limit;
    const where = status ? { orderStatus: status } : {};

    const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
        })
    ]);

    return {
        orders,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
        }
    };
};

const updateOrderStatus = async (id, status, paymentStatus) => {
    const data = {};
    if (status) data.orderStatus = status;
    if (paymentStatus) data.paymentStatus = paymentStatus;

    return await prisma.order.update({
        where: { id },
        data
    });
};

module.exports = { getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
