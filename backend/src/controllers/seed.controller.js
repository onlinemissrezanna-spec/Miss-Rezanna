const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const prisma = require('../config/db');
const slugify = require('../utils/slugify');

const productCatalog = {
    'ethereal-kurti': {
        name: 'Ethereal Embroidered Kurti',
        price: '3000',
        images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'New Collection',
        description: 'Intricate threadwork with a relaxed silhouette. Crafted from pure, ethically sourced Mulberry silk, offering a drape that moves like liquid dusk.'
    },
    'ivory-fusion': {
        name: 'Ivory Fusion Set',
        price: '3500',
        images: ['images/B.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Bestseller',
        description: 'A modern take on traditional elegance. Designed for a fluid, flattering drape that gracefully contours the body without clinging.'
    },
    'signature-tunic': {
        name: 'Signature Silk Tunic',
        price: '4000',
        images: ['images/C.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Limited Edition',
        description: 'Flowing lines rendered in pure mulberry silk. True to size. We recommend selecting your standard size for the intended relaxed fit.'
    },
    'heritage-pantsuit': {
        name: 'Heritage Pantsuit',
        price: '5000',
        images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Signature Classic',
        description: 'Tailored perfection for the confident woman. Features exquisite, hand-finished zari embroidery along the collar and cuffs.'
    },
    'floral-grace': {
        name: 'Floral Grace Ensemble',
        price: '3200',
        images: ['images/design 1 col 2.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Festive Edit',
        description: 'Intricate floral embroidery inspired by timeless elegance. Perfect for evening celebrations.'
    },
    'botanical-bloom': {
        name: 'Botanical Bloom Set',
        price: '3800',
        images: ['images/design 1 col 2.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Spring Collection',
        description: 'Contemporary silhouettes with handcrafted floral detailing.'
    },
    'summer-heritage': {
        name: 'Summer Heritage',
        price: '2800',
        images: ['images/NN.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Summer Essentials',
        description: 'Premium summer essentials designed for effortless sophistication.'
    },
    'midnight-kurti': {
        name: 'Midnight Silk Kurti',
        price: '3000',
        images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Festive Edit',
        description: 'An uncompromising statement of elegance. Crafted from pure, ethically sourced Mulberry silk, the Midnight Kurti offers a silhouette that moves like liquid dusk.'
    },
    'crimson-set': {
        name: 'Crimson Festivity Set',
        price: '3000',
        images: ['images/C.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Autumn Collection',
        description: 'Deep earthy tones combined with quiet luxury and minimal embellishments.'
    },
    'dusk-dupatta': {
        name: 'Dusk Organza Dupatta',
        price: '3000',
        images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Accessories',
        description: 'A sheer, elegant drape designed to complement any evening attire.'
    },
    'terracotta-pant': {
        name: 'Terracotta Flow Pant',
        price: '3000',
        images: ['images/N.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Bottoms',
        description: 'Wide-leg trousers offering supreme comfort and effortless style.'
    },
    'olive-kurti': {
        name: 'Olive Blossom Kurti',
        price: '3000',
        images: ['images/design 1 col 2.jpeg', 'images/L.jpeg', 'images/N.jpeg'],
        label: 'Autumn Collection',
        description: 'Crafted to move beautifully, providing comfort without compromising on sheer elegance.'
    }
};

const seedDatabase = asyncHandler(async (req, res) => {
    // 1. Create a default category
    let category = await prisma.category.findFirst({ where: { slug: 'signature-collection' }});
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: 'Signature Collection',
                slug: 'signature-collection',
                description: 'The iconic Miss Rezanna collection.'
            }
        });
    }

    // 2. Insert products
    const insertedProducts = [];
    for (const [slug, prod] of Object.entries(productCatalog)) {
        const existing = await prisma.product.findUnique({ where: { slug } });
        if (!existing) {
            const newProduct = await prisma.product.create({
                data: {
                    name: prod.name,
                    slug: slug,
                    description: prod.description,
                    basePrice: parseFloat(prod.price),
                    categoryId: category.id,
                    images: JSON.stringify(prod.images), // Store array as JSON string for now
                    features: JSON.stringify([prod.label]),
                    variants: {
                        create: [
                            {
                                sku: `SKU-${slug}-M`,
                                size: 'M',
                                color: 'Standard',
                                priceAdjustment: 0,
                                inventory: {
                                    create: { stock: 100 }
                                }
                            }
                        ]
                    }
                }
            });
            insertedProducts.push(newProduct);
        }
    }

    res.status(200).json(new ApiResponse(200, { inserted: insertedProducts.length }, 'Database seeded successfully.'));
});

module.exports = { seedDatabase };
