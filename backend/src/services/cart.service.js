const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

const getCartIdentifier = (userId, guestToken) => {
    if (userId) return { userId };
    if (guestToken) return { guestToken };
    throw new ApiError(400, 'User ID or Guest Token required');
};

const getOrCreateCart = async (userId, guestToken) => {
    const where = getCartIdentifier(userId, guestToken);
    let cart = await prisma.cart.findUnique({ where });

    if (!cart) {
        cart = await prisma.cart.create({ data: where });
    }
    return cart;
};

const mergeGuestCart = async (userId, guestToken) => {
    if (!guestToken) return;

    const guestCart = await prisma.cart.findUnique({
        where: { guestToken },
        include: { items: true }
    });

    if (!guestCart || guestCart.items.length === 0) return;

    const userCart = await getOrCreateCart(userId, null);

    for (const item of guestCart.items) {
        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: userCart.id, productId: item.productId, variantId: item.variantId }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + item.quantity, subtotal: existingItem.subtotal.add(item.subtotal) }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: userCart.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount,
                    subtotal: item.subtotal
                }
            });
        }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
};

const calculateTotals = (items, taxPercentage = 0) => {
    let subtotal = 0;
    items.forEach(item => {
        subtotal += parseFloat(item.subtotal);
    });
    
    // In a real system, tax is calculated per item based on category/product tax rate.
    // For simplicity, we assume 0% global tax if not specified per item.
    const tax = subtotal * (taxPercentage / 100);
    const shipping = subtotal > 0 ? 150 : 0; // Flat ₹150 shipping placeholder
    
    return {
        subtotal,
        tax,
        shipping,
        grandTotal: subtotal + tax + shipping
    };
};

const getCart = async (userId, guestToken) => {
    const where = getCartIdentifier(userId, guestToken);
    const cart = await prisma.cart.findUnique({
        where,
        include: {
            items: {
                include: {
                    product: { select: { id: true, name: true, slug: true, images: { take: 1, where: { isPrimary: true } } } },
                    variant: true
                }
            }
        }
    });

    if (!cart) return { items: [], totals: calculateTotals([]) };

    return {
        id: cart.id,
        items: cart.items,
        totals: calculateTotals(cart.items)
    };
};

const addToCart = async (userId, guestToken, productId, variantId, quantity) => {
    const cart = await getOrCreateCart(userId, guestToken);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'active') throw new ApiError(404, 'Product not available');

    let price = product.salePrice || product.price;
    
    // Inventory check
    if (variantId) {
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { inventory: true }
        });
        if (!variant) throw new ApiError(404, 'Variant not found');
        if (variant.inventory && variant.inventory.stock < quantity) {
            throw new ApiError(400, 'Not enough stock available');
        }
        price = parseFloat(price) + parseFloat(variant.priceAdjustment);
    } else {
        // If no variants, check if product has any required variants
        const variants = await prisma.productVariant.findMany({ where: { productId } });
        if (variants.length > 0) throw new ApiError(400, 'Please select a variant (size/color)');
    }

    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId, variantId: variantId || null }
    });

    const subtotal = price * (existingItem ? existingItem.quantity + quantity : quantity);

    if (existingItem) {
        // Check total stock for new combined quantity
        if (variantId) {
            const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, include: { inventory: true }});
            if (variant.inventory && variant.inventory.stock < (existingItem.quantity + quantity)) {
                throw new ApiError(400, 'Not enough stock available for combined quantity');
            }
        }
        
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity, subtotal }
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                variantId: variantId || null,
                quantity,
                unitPrice: price,
                subtotal
            }
        });
    }

    return await getCart(userId, guestToken);
};

const updateCartItemQuantity = async (userId, guestToken, itemId, quantity) => {
    const where = getCartIdentifier(userId, guestToken);
    const cart = await prisma.cart.findUnique({ where, include: { items: true } });
    if (!cart) throw new ApiError(404, 'Cart not found');

    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new ApiError(404, 'Item not found in cart');

    if (quantity === 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
        return await getCart(userId, guestToken);
    }

    if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId }, include: { inventory: true }});
        if (variant.inventory && variant.inventory.stock < quantity) {
            throw new ApiError(400, 'Not enough stock available');
        }
    }

    const newSubtotal = parseFloat(item.unitPrice) * quantity;
    
    await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity, subtotal: newSubtotal }
    });

    return await getCart(userId, guestToken);
};

const removeFromCart = async (userId, guestToken, itemId) => {
    const cart = await prisma.cart.findUnique({ where: getCartIdentifier(userId, guestToken) });
    if (!cart) return;

    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    return await getCart(userId, guestToken);
};

const clearCart = async (userId, guestToken) => {
    const cart = await prisma.cart.findUnique({ where: getCartIdentifier(userId, guestToken) });
    if (!cart) return;

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { items: [], totals: calculateTotals([]) };
};

module.exports = { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart, mergeGuestCart };
