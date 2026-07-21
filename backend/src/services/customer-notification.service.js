const prisma = require('../config/db');

const getNotifications = async (userId) => {
    return await prisma.customerNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

const markAsRead = async (userId, notificationId) => {
    return await prisma.customerNotification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true }
    });
};

const markAllAsRead = async (userId) => {
    return await prisma.customerNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
    });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
