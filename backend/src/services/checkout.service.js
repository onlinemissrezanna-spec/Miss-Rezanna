const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const cartService = require('./cart.service');
const couponService = require('./coupon.service');
const shippingService = require('./shipping.service');

const processCheckout = async (userId, addressId, shippingMethodId, couponCode) => {
    // 1. Validate Cart & Inventory
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true, variant: { include: { inventory: true } } } } }
    });

    if (!cart || cart.items.length === 0) throw new ApiError(400, 'Cart is empty');

    // Re-verify exact stock for all items
    for (const item of cart.items) {
        if (item.variantId) {
            if (item.variant.inventory.stock < item.quantity) {
                throw new ApiError(400, `Not enough stock for ${item.product.name} - ${item.variant.size}/${item.variant.color}`);
            }
        }
    }

    // 2. Validate Address
    const address = await prisma.address.findUnique({ where: { id: addressId, userId } });
    if (!address) throw new ApiError(400, 'Invalid shipping address');

    // 3. Calculate Totals & Taxes
    let subtotal = 0;
    let totalTax = 0;

    cart.items.forEach(item => {
        const itemSubtotal = parseFloat(item.unitPrice) * item.quantity;
        subtotal += itemSubtotal;
        
        // Calculate tax based on product taxPercentage
        const taxRate = parseFloat(item.product.taxPercentage) / 100;
        totalTax += itemSubtotal * taxRate;
    });

    // 4. Validate Coupon
    let discount = 0;
    let validCoupon = null;
    if (couponCode) {
        const result = await couponService.validateCoupon(couponCode, subtotal, userId);
        discount = result.discount;
        validCoupon = result.coupon;
    }

    // 5. Calculate Shipping
    const shipping = await shippingService.calculateShipping(shippingMethodId, subtotal);
    let shippingCharge = shipping.charge;
    
    if (validCoupon && validCoupon.type === 'FREE_SHIPPING') {
        shippingCharge = 0;
    }

    const grandTotal = (subtotal + totalTax + shippingCharge) - discount;

    // 6. Generate Order Number
    const orderNumber = `MR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 7. Prisma Transaction (Atomic Lock)
    const transaction = await prisma.$transaction(async (tx) => {
        // Create Order
        const order = await tx.order.create({
            data: {
                orderNumber,
                userId,
                shippingAddressId: addressId,
                shippingMethodId,
                couponId: validCoupon ? validCoupon.id : null,
                subtotal,
                discount,
                tax: totalTax,
                shippingCharge,
                grandTotal,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        subtotal: parseFloat(item.unitPrice) * item.quantity,
                        tax: (parseFloat(item.unitPrice) * item.quantity) * (parseFloat(item.product.taxPercentage) / 100)
                    }))
                }
            }
        });

        // Decrement Inventory
        for (const item of cart.items) {
            if (item.variantId) {
                await tx.inventory.update({
                    where: { variantId: item.variantId },
                    data: { stock: { decrement: item.quantity }, reservedStock: { increment: item.quantity } }
                });
            }
        }

        // Record Coupon Usage
        if (validCoupon) {
            await tx.couponUsage.create({
                data: { couponId: validCoupon.id, userId, orderId: order.id }
            });
            await tx.coupon.update({
                where: { id: validCoupon.id },
                data: { usageCount: { increment: 1 } }
            });
        }

        // Nuke Cart
        await tx.cart.delete({ where: { id: cart.id } });

        return order;
    });

    return transaction;
};

module.exports = { processCheckout };
