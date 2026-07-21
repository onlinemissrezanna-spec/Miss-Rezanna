const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const getShippingMethods = async () => {
    return await prisma.shippingMethod.findMany({ where: { isActive: true } });
};

const calculateShipping = async (methodId, cartSubtotal) => {
    const method = await prisma.shippingMethod.findUnique({ where: { id: methodId } });
    if (!method || !method.isActive) throw new ApiError(404, 'Invalid shipping method');

    // Free shipping logic overrides if it's named 'Free Shipping' and cart > ₹5000
    // In a real system, you'd have a 'freeShippingThreshold' on the model.
    if (method.name === 'Free Shipping' && cartSubtotal >= 5000) {
        return { charge: 0, method };
    }

    return { charge: parseFloat(method.charge), method };
};

module.exports = { getShippingMethods, calculateShipping };
