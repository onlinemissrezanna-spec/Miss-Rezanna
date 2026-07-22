const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const cartService = require('./cart.service');

const getWishlist = async (userId) => {
    let wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: { select: { id: true, name: true, slug: true, price: true, salePrice: true, images: { take: 1, where: { isPrimary: true } } } },
                    variant: true
                }
            }
        }
    });

    if (!wishlist) {
        wishlist = await prisma.wishlist.create({ data: { userId }, include: { items: true } });
    }

    return wishlist;
};

const addToWishlist = async (userId, productId, variantId) => {
    const wishlist = await getWishlist(userId);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, 'Product not found');

    const existingItem = await prisma.wishlistItem.findFirst({
        where: { wishlistId: wishlist.id, productId, variantId: variantId || null }
    });

    if (!existingItem) {
        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId,
                variantId: variantId || null
            }
        });
    }

    return await getWishlist(userId);
};

const removeFromWishlist = async (userId, itemId) => {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) throw new ApiError(404, 'Wishlist not found');

    await prisma.wishlistItem.deleteMany({ where: { id: itemId, wishlistId: wishlist.id } });
    return await getWishlist(userId);
};

const moveToCart = async (userId, itemId) => {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) throw new ApiError(404, 'Wishlist not found');

    const item = await prisma.wishlistItem.findFirst({ where: { id: itemId, wishlistId: wishlist.id } });
    if (!item) throw new ApiError(404, 'Item not found in wishlist');

    // Add to Cart (throws if out of stock)
    await cartService.addToCart(userId, null, item.productId, item.variantId, 1);

    // If successfully added to cart, remove from wishlist
    await prisma.wishlistItem.delete({ where: { id: itemId } });

    return await getWishlist(userId);
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist, moveToCart };
