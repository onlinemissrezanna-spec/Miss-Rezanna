const prisma = require('../config/db');

const logAdminAction = async (adminId, action, entity, entityId, oldValue = null, newValue = null, ipAddress = null) => {
    await prisma.adminLog.create({
        data: { adminId, action, entity, entityId, oldValue, newValue, ipAddress }
    });
};

const bulkUpdateProductStatus = async (adminId, productIds, status) => {
    await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { status }
    });

    await logAdminAction(adminId, 'BULK_UPDATE_STATUS', 'Product', null, null, { productIds, status });
    return true;
};

const bulkDeleteProducts = async (adminId, productIds) => {
    await prisma.product.deleteMany({
        where: { id: { in: productIds } }
    });

    await logAdminAction(adminId, 'BULK_DELETE', 'Product', null, null, { productIds });
    return true;
};

const adjustInventory = async (adminId, variantId, adjustment, reason) => {
    const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { inventory: true, product: true }
    });

    if (!variant || !variant.inventory) throw new Error('Variant or inventory not found');

    const previousStock = variant.inventory.stock;
    const newStock = previousStock + adjustment;

    if (newStock < 0) throw new Error('Stock cannot be negative');

    await prisma.$transaction(async (tx) => {
        await tx.inventory.update({
            where: { variantId },
            data: { stock: newStock }
        });

        await tx.inventoryLog.create({
            data: {
                variantId,
                adminId,
                adjustment,
                reason,
                previousStock,
                newStock
            }
        });

        await logAdminAction(adminId, 'ADJUST_INVENTORY', 'ProductVariant', variantId, { stock: previousStock }, { stock: newStock });
    });

    return newStock;
};

module.exports = { bulkUpdateProductStatus, bulkDeleteProducts, adjustInventory, logAdminAction };
