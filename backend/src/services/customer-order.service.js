const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('./customer-profile.service');

const getTrackingTimeline = async (orderId, userId) => {
    const order = await prisma.order.findUnique({ where: { id: orderId, userId } });
    if (!order) throw new ApiError(404, 'Order not found');

    // In a real system, you'd have a separate OrderHistory table for timestamps of each status change.
    // For now, we dynamically map current status to a timeline array.
    const statuses = ['Pending Confirmation', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered'];
    
    let timeline = statuses.map(status => ({
        status,
        completed: statuses.indexOf(status) <= statuses.indexOf(order.orderStatus) && order.orderStatus !== 'Cancelled',
        date: status === 'Pending Confirmation' ? order.createdAt : (status === order.orderStatus ? order.updatedAt : null)
    }));

    if (order.orderStatus === 'Cancelled') {
        timeline.push({ status: 'Cancelled', completed: true, date: order.updatedAt });
    }

    return timeline;
};

const cancelOrder = async (orderId, userId, reason, ipAddress) => {
    const order = await prisma.order.findUnique({ where: { id: orderId, userId } });
    if (!order) throw new ApiError(404, 'Order not found');

    // Strict Cancellation Policy
    const blockedStatuses = ['Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
    if (blockedStatuses.includes(order.orderStatus)) {
        throw new ApiError(400, `Order cannot be cancelled because it is already ${order.orderStatus}`);
    }

    await prisma.$transaction(async (tx) => {
        await tx.order.update({
            where: { id: orderId },
            data: { orderStatus: 'Cancelled' }
        });

        // Add to activities
        await logActivity(userId, 'ORDER_CANCELLED', { orderId, reason }, ipAddress);
        
        // Return inventory
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
            if (item.variantId) {
                await tx.inventory.update({
                    where: { variantId: item.variantId },
                    data: { stock: { increment: item.quantity }, reservedStock: { decrement: item.quantity } }
                });
            }
        }
    });

    return true;
};

const createReturnRequest = async (userId, orderId, orderItemId, reason, notes, ipAddress) => {
    const order = await prisma.order.findUnique({ where: { id: orderId, userId } });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.orderStatus !== 'Delivered') throw new ApiError(400, 'Cannot return an item that has not been delivered');

    const item = await prisma.orderItem.findFirst({ where: { id: orderItemId, orderId } });
    if (!item) throw new ApiError(404, 'Order item not found');

    // Check if return already requested
    const existing = await prisma.returnRequest.findFirst({ where: { orderItemId } });
    if (existing) throw new ApiError(400, 'Return request already exists for this item');

    const returnReq = await prisma.returnRequest.create({
        data: { userId, orderId, orderItemId, reason, notes }
    });

    await logActivity(userId, 'RETURN_REQUESTED', { returnId: returnReq.id, reason }, ipAddress);
    return returnReq;
};

module.exports = { getTrackingTimeline, cancelOrder, createReturnRequest };
