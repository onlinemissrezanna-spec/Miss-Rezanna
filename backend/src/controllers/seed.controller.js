const asyncHandler = require('../middlewares/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const prisma = require('../config/db');

const productCatalog = [
    { slug: 'ethereal-kurti',      name: 'Ethereal Embroidered Kurti',   price: 3000, sku: 'MR-KU-001', images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'Intricate threadwork with a relaxed silhouette. Crafted from pure, ethically sourced Mulberry silk.' },
    { slug: 'ivory-fusion',        name: 'Ivory Fusion Set',             price: 3500, sku: 'MR-FS-002', images: ['images/B.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'A modern take on traditional elegance. Designed for a fluid, flattering drape.' },
    { slug: 'signature-tunic',     name: 'Signature Silk Tunic',         price: 4000, sku: 'MR-TU-003', images: ['images/C.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'Flowing lines rendered in pure mulberry silk. True to size for the intended relaxed fit.' },
    { slug: 'heritage-pantsuit',   name: 'Heritage Pantsuit',            price: 5000, sku: 'MR-PS-004', images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'Tailored perfection for the confident woman. Hand-finished zari embroidery.' },
    { slug: 'floral-grace',        name: 'Floral Grace Ensemble',        price: 3200, sku: 'MR-FG-005', images: ['images/design 1 col 2.jpeg', 'images/L.jpeg', 'images/N.jpeg'],description: 'Intricate floral embroidery inspired by timeless elegance.' },
    { slug: 'botanical-bloom',     name: 'Botanical Bloom Set',          price: 3800, sku: 'MR-BB-006', images: ['images/design 1 col 2.jpeg', 'images/L.jpeg', 'images/N.jpeg'],description: 'Contemporary silhouettes with handcrafted floral detailing.' },
    { slug: 'summer-heritage',     name: 'Summer Heritage',              price: 2800, sku: 'MR-SH-007', images: ['images/NN.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'Premium summer essentials designed for effortless sophistication.' },
    { slug: 'midnight-kurti',      name: 'Midnight Silk Kurti',          price: 3000, sku: 'MR-MK-008', images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'An uncompromising statement of elegance. The Midnight Kurti moves like liquid dusk.' },
    { slug: 'crimson-set',         name: 'Crimson Festivity Set',        price: 3000, sku: 'MR-CS-009', images: ['images/C.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'Deep earthy tones combined with quiet luxury and minimal embellishments.' },
    { slug: 'dusk-dupatta',        name: 'Dusk Organza Dupatta',         price: 3000, sku: 'MR-DD-010', images: ['images/A.jpeg', 'images/L.jpeg', 'images/N.jpeg'],             description: 'A sheer, elegant drape designed to complement any evening attire.' },
    { slug: 'terracotta-pant',     name: 'Terracotta Flow Pant',         price: 3000, sku: 'MR-TP-011', images: ['images/N.jpeg', 'images/L.jpeg'],                               description: 'Wide-leg trousers offering supreme comfort and effortless style.' },
    { slug: 'olive-kurti',         name: 'Olive Blossom Kurti',          price: 3000, sku: 'MR-OK-012', images: ['images/design 1 col 2.jpeg', 'images/L.jpeg', 'images/N.jpeg'],description: 'Crafted to move beautifully, providing comfort without compromising on elegance.' },
];

const seedDatabase = asyncHandler(async (req, res) => {

    // 1. Create or find default Shipping Method (required for orders)
    let shipping = await prisma.shippingMethod.findFirst({ where: { name: 'Standard Delivery' } });
    if (!shipping) {
        shipping = await prisma.shippingMethod.create({
            data: {
                name: 'Standard Delivery',
                description: '5-7 Business Days',
                charge: 0,
                estimatedDays: '5-7 Business Days',
                isActive: true
            }
        });
    }

    // 2. Create or find default category
    let category = await prisma.category.findFirst({ where: { slug: 'signature-collection' } });
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: 'Signature Collection',
                slug: 'signature-collection',
                description: 'The iconic Miss Rezanna collection.'
            }
        });
    }

    // 3. Insert products using correct Prisma schema fields
    const insertedProducts = [];
    for (const prod of productCatalog) {
        const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
        if (!existing) {
            const newProduct = await prisma.product.create({
                data: {
                    name: prod.name,
                    slug: prod.slug,
                    sku: prod.sku,
                    description: prod.description,
                    price: prod.price,          // correct field name from schema
                    categoryId: category.id,
                    status: 'active',
                    isFeatured: true,
                    isNewArrival: true,
                    // ProductImage is a relation, use nested create
                    images: {
                        create: prod.images.map((url, idx) => ({
                            imageUrl: url,
                            altText: prod.name,
                            sortOrder: idx,
                            isPrimary: idx === 0
                        }))
                    },
                    // Create size variants with inventory
                    variants: {
                        create: ['XS','S','M','L','XL'].map(size => ({
                            size,
                            color: 'Standard',
                            variantSku: `${prod.sku}-${size}`,
                            priceAdjustment: 0,
                            inventory: {
                                create: { stock: 50, lowStockThreshold: 5 }
                            }
                        }))
                    }
                }
            });
            insertedProducts.push(newProduct.name);
        }
    }

    // 4. Create Admin role & user
    let adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: 'Admin',
                description: 'Full administrative access',
                permissions: ['products:read','products:write','orders:read','orders:write','users:read']
            }
        });
    }

    const { hashPassword } = require('../utils/password');
    const hashedPassword = await hashPassword('admin123');

    let adminUser = await prisma.user.findFirst({ where: { email: 'admin@missrezanna.com' } });
    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                firstName: 'Admin',
                lastName: 'Miss Rezanna',
                email: 'admin@missrezanna.com',
                password: hashedPassword,
                roleId: adminRole.id,
                isVerified: true,
                status: 'active'
            }
        });
    }

    res.status(200).json(new ApiResponse(200, {
        productsInserted: insertedProducts.length,
        productNames: insertedProducts,
        adminUser: {
            email: 'admin@missrezanna.com',
            password: 'admin123',
            note: 'Use these credentials to login to the admin panel at /admin.html'
        }
    }, 'Database seeded successfully.'));
});

const initDatabase = async (req, res, next) => {
    try {
        const { execSync } = require('child_process');
        const output = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf-8', timeout: 60000 });
        res.status(200).json({
            status: 200,
            message: "Database initialized successfully.",
            output: output
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to initialize database.",
            error: error.message,
            stdout: error.stdout ? error.stdout.toString() : null,
            stderr: error.stderr ? error.stderr.toString() : null
        });
    }
};

const clearOrders = asyncHandler(async (req, res) => {
    try { await prisma.paymentAudit.deleteMany({}); } catch(e){}
    try { await prisma.payment.deleteMany({}); } catch(e){}
    try { await prisma.invoice.deleteMany({}); } catch(e){}
    try { await prisma.couponUsage.deleteMany({}); } catch(e){}
    try { await prisma.returnRequest.deleteMany({}); } catch(e){}
    try { await prisma.exchangeRequest.deleteMany({}); } catch(e){}
    try { await prisma.orderItem.deleteMany({}); } catch(e){}
    const deleted = await prisma.order.deleteMany({});

    res.status(200).json(new ApiResponse(200, { deletedCount: deleted.count }, 'All orders cleared successfully'));
});

module.exports = {
    seedDatabase,
    initDatabase,
    clearOrders
};
