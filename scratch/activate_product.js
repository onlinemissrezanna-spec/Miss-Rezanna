const path = require('path');
const prisma = require(path.join(__dirname, '../backend/src/config/db'));

async function activateProduct() {
  try {
    const updated = await prisma.product.update({
      where: { id: 1 },
      data: {
        name: 'Navy Blue Floral Embroidered Kurta Pant Set',
        slug: 'navy-blue-embroidered-kurta-pant-set',
        status: 'active',
        price: 4500,
        description: 'A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.',
        seoTitle: 'Navy Blue Embroidered Kurta Pant Set for Women | MISS REZANNA',
        seoDescription: 'Shop the navy blue embroidered kurta pant set by MISS REZANNA, featuring intricate floral embroidery and a sophisticated contemporary silhouette.',
        seoKeywords: 'navy blue kurta pant set, navy blue kurta set for women, floral embroidered kurta set, embroidered kurta pant set, premium kurta set for women',
        images: {
          deleteMany: {},
          create: [
            { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-3.png', altText: 'Navy Blue Floral Embroidered Kurta Pant Set - Front View', sortOrder: 0, isPrimary: true },
            { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-1.png', altText: 'Navy Blue Floral Embroidered Kurta Pant Set - Side Profile', sortOrder: 1, isPrimary: false },
            { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-2.png', altText: 'Navy Blue Floral Embroidered Kurta Pant Set - Side Embroidery Detail', sortOrder: 2, isPrimary: false },
            { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-4.png', altText: 'Navy Blue Floral Embroidered Kurta Pant Set - 3/4 Angle', sortOrder: 3, isPrimary: false },
            { imageUrl: 'images/navy-blue-embroidered-kurta-pant-set-5.png', altText: 'Navy Blue Floral Embroidered Kurta Pant Set - Full Silhouette', sortOrder: 4, isPrimary: false }
          ]
        }
      }
    });
    console.log('Successfully activated product:', updated.name, 'with ID:', updated.id);
  } catch (err) {
    console.error('Error activating product:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

activateProduct();
