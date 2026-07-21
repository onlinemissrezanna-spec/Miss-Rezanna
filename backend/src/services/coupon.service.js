const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const validateCoupon = async (code, cartSubtotal, userId) => {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) throw new ApiError(400, 'Invalid or expired coupon');

    const now = new Date();
    if (coupon.endDate && new Date(coupon.endDate) < now) throw new ApiError(400, 'Coupon has expired');
    if (coupon.startDate && new Date(coupon.startDate) > now) throw new ApiError(400, 'Coupon is not active yet');

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        throw new ApiError(400, 'Coupon usage limit reached');
    }

    if (coupon.minOrderValue && cartSubtotal < parseFloat(coupon.minOrderValue)) {
        throw new ApiError(400, `Minimum order value of ₹${coupon.minOrderValue} required`);
    }

    if (coupon.perUserLimit && userId) {
        const usageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
        if (usageCount >= coupon.perUserLimit) {
            throw new ApiError(400, 'You have reached the maximum usage limit for this coupon');
        }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
        discount = cartSubtotal * (parseFloat(coupon.discountValue) / 100);
        if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {
            discount = parseFloat(coupon.maxDiscount);
        }
    } else if (coupon.type === 'FLAT_AMOUNT') {
        discount = parseFloat(coupon.discountValue);
    } else if (coupon.type === 'FREE_SHIPPING') {
        discount = 0; // Handled during shipping calculation
    }

    if (discount > cartSubtotal) discount = cartSubtotal;

    return { coupon, discount };
};

module.exports = { validateCoupon };
