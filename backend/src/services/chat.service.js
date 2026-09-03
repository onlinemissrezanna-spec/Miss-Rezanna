const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const logger = require('../utils/logger');

// ─── In-Memory Product Cache (refreshes every 5 minutes) ───
let cachedProductContext = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── Default Catalog of All 13 Miss Rezanna Products ───
// Guarantees the AI knows all products and prices immediately, even if DB is cold or unreachable
const DEFAULT_PRODUCTS = [
    {
        name: 'Navy Blue Floral Embroidered Kurta Pant Set',
        slug: 'navy-blue-embroidered-kurta-pant-set',
        sku: 'MR-KS-013',
        price: 4500,
        category: 'Festive Edit · Kurta Pant Set',
        fabric: 'Premium Blend with intricate multicolor threadwork',
        fit: 'Straight / Relaxed Fit with coordinated straight pants',
        sizes: 'XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL (All In Stock)',
        description: 'A refined navy blue kurta pant set featuring intricate multicolour floral embroidery across front and sleeves, paired with matching straight-cut pants. Designed for festive gatherings, intimate celebrations, and elegant evening occasions.'
    },
    {
        name: 'Ethereal Embroidered Kurti',
        slug: 'ethereal-kurti',
        sku: 'MR-KU-001',
        price: 3000,
        category: 'Signature Collection',
        fabric: 'Pure, ethically sourced Mulberry Silk',
        fit: 'Relaxed luxury silhouette',
        sizes: 'XS, S, M, L, XL, 2XL (In Stock)',
        description: 'Intricate threadwork with a relaxed silhouette. Crafted from pure, ethically sourced Mulberry silk. Delicately hand-finished by master Ludhiana artisans.'
    },
    {
        name: 'Midnight Silk Kurti',
        slug: 'midnight-kurti',
        sku: 'MR-MK-008',
        price: 3000,
        category: 'Signature Collection',
        fabric: 'Lustrous Mulberry Silk',
        fit: 'Fluid draped silhouette',
        sizes: 'XS, S, M, L, XL, 2XL (In Stock)',
        description: 'An uncompromising statement of quiet luxury. The Midnight Kurti moves like liquid dusk with minimal embellishments and royal presence.'
    },
    {
        name: 'Signature Silk Tunic',
        slug: 'signature-tunic',
        sku: 'MR-TU-003',
        price: 4000,
        category: 'Signature Collection',
        fabric: '100% Pure Mulberry Silk',
        fit: 'Relaxed modern drape',
        sizes: 'XS, S, M, L, XL, 2XL (In Stock)',
        description: 'Flowing lines rendered in pure mulberry silk. True to size for an effortless, regal silhouette.'
    },
    {
        name: 'Heritage Pantsuit',
        slug: 'heritage-pantsuit',
        sku: 'MR-PS-004',
        price: 5000,
        category: 'Couture Ensemble',
        fabric: 'Tailored Silk Blend with Zari Detailing',
        fit: 'Structured tailored jacket with cigarette trousers',
        sizes: 'XS, S, M, L, XL (In Stock)',
        description: 'Tailored perfection for the confident woman. Features hand-finished zari embroidery and bespoke atelier craftsmanship.'
    },
    {
        name: 'Ivory Fusion Set',
        slug: 'ivory-fusion',
        sku: 'MR-FS-002',
        price: 3500,
        category: 'Fusion Collection',
        fabric: 'Chanderi & Soft Silk',
        fit: 'Fluid contemporary drape',
        sizes: 'XS, S, M, L, XL, 2XL (In Stock)',
        description: 'A modern take on traditional elegance. Ivory tones with subtle gold accents, designed for festive celebrations.'
    },
    {
        name: 'Floral Grace Ensemble',
        slug: 'floral-grace',
        sku: 'MR-FG-005',
        price: 3200,
        category: 'Festive Edit',
        fabric: 'Organic Cotton Silk',
        fit: 'A-line flattering cut',
        sizes: 'XS, S, M, L, XL, 2XL, 3XL (In Stock)',
        description: 'Intricate floral embroidery inspired by heritage Punjab gardens. Breathable and luxurious for daytime and evening festivities.'
    },
    {
        name: 'Botanical Bloom Set',
        slug: 'botanical-bloom',
        sku: 'MR-BB-006',
        price: 3800,
        category: 'Co-ord Ensemble',
        fabric: 'Artisanal Handwoven Silk Blend',
        fit: 'Contemporary relaxed fit',
        sizes: 'S, M, L, XL, 2XL (In Stock)',
        description: 'Contemporary silhouettes with handcrafted floral detailing. Includes coordinates for an effortless matching ensemble.'
    },
    {
        name: 'Summer Heritage',
        slug: 'summer-heritage',
        sku: 'MR-SH-007',
        price: 2800,
        category: 'Everyday Luxury',
        fabric: 'Fine Breathable Cotton Silk',
        fit: 'Straight easy silhouette',
        sizes: 'XS, S, M, L, XL, 2XL, 3XL, 4XL (In Stock)',
        description: 'Premium summer essentials designed for effortless sophistication in warm weather with heirloom detailing.'
    },
    {
        name: 'Crimson Festivity Set',
        slug: 'crimson-set',
        sku: 'MR-CS-009',
        price: 3000,
        category: 'Festive Edit',
        fabric: 'Rich Raw Silk Blend',
        fit: 'Traditional festive fit with matching trousers',
        sizes: 'S, M, L, XL, 2XL (In Stock)',
        description: 'Deep earthy crimson tones combined with quiet luxury and hand-placed subtle embellishments.'
    },
    {
        name: 'Dusk Organza Dupatta',
        slug: 'dusk-dupatta',
        sku: 'MR-DD-010',
        price: 3000,
        category: 'Accessories & Drapes',
        fabric: 'Pure Sheer Organza with Scalloped Zari Borders',
        fit: 'Free Size Full Length Dupatta (2.5 meters)',
        sizes: 'Free Size (In Stock)',
        description: 'A sheer, elegant drape designed to complement any evening or festive kurti set. Features delicate scalloped hand-embroidery.'
    },
    {
        name: 'Terracotta Flow Pant',
        slug: 'terracotta-pant',
        sku: 'MR-TP-011',
        price: 3000,
        category: 'Luxury Bottoms',
        fabric: 'Flowing Modal Silk',
        fit: 'Wide-leg comfort palazzo fit with elasticated waistband',
        sizes: 'S, M, L, XL, 2XL, 3XL (In Stock)',
        description: 'Wide-leg trousers offering supreme comfort, fluid movement, and effortless mix-and-match versatility.'
    },
    {
        name: 'Olive Blossom Kurti',
        slug: 'olive-kurti',
        sku: 'MR-OK-012',
        price: 3000,
        category: 'Signature Collection',
        fabric: 'Fine Chanderi Silk',
        fit: 'Relaxed straight fit',
        sizes: 'XS, S, M, L, XL, 2XL (In Stock)',
        description: 'Crafted to move beautifully, providing comfort without compromising on elegance. Subdued olive tone with subtle resham embroidery.'
    }
];

// ─── Brand Knowledge System Prompt ───
const BRAND_SYSTEM_PROMPT = `You are the official AI Stylist for MISS REZANNA — a luxury Indian knitwear and ethnic fashion brand. Your name is "Miss Rezanna AI Stylist".

## BRAND IDENTITY
- **Brand**: MISS REZANNA (website: https://www.missrezanna.com)
- **Tagline**: "Crafted for the Moments That Matter" / "Designed for Grace. Made to Last."
- **Philosophy**: Thoughtfully crafted for women who appreciate timeless elegance, refined craftsmanship, and everyday luxury.
- **Heritage**: Born from the esteemed Kinshu Knitwear legacy in Punjab, India — carrying forward decades of Indian textile craftsmanship, handloom weaving, and luxury garment construction.
- **Founder**: Pravel Setia — "True luxury is not just in the aesthetic, but in the feeling of absolute confidence it provides the moment you put it on."

## ATELIER & CONTACT
- **Location**: St. No.3, Kinshu Knitwears, E-2/2680/1, Rahon Rd, Guru Vihar, Jodhewal, Ludhiana, Punjab 141007, India
- **WhatsApp**: +91 98773 27186 (direct link: https://wa.me/919877327186)
- **Email**: support@missrezanna.com
- **Instagram**: @miss_rezanna (https://www.instagram.com/miss_rezanna)

## SHIPPING & DELIVERY
- Complimentary express shipping across India on orders over ₹15,000
- Standard free shipping on all orders across India
- Ready-to-wear pieces dispatch in 2–4 business days
- Delivery via insured courier in 3–6 working days
- Worldwide/International shipping available on request via WhatsApp

## RETURNS & EXCHANGES
- 7-day hassle-free size exchanges on unworn garments with tags attached
- 14-day return window for unworn items
- For artisanal defects or transit issues, contact atelier within 48 hours of delivery
- Bespoke/custom tailored orders are made specifically for you and are non-returnable

## SIZING & BESPOKE TAILORING
- Standard sizes: XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL
- Relaxed luxury drape designed for comfort and flattering movement
- For bespoke custom measurements or custom sleeve lengths, recommend WhatsApp atelier consultation

## PAYMENT
- Secure payments via Razorpay (UPI, Google Pay, PhonePe, Credit/Debit Cards, Net Banking)
- Cash on Delivery (COD) available for select pincodes

## YOUR RESPONSE RULES
1. Be warm, welcoming, professional, and luxurious in tone — like a private stylist at a royal Ludhiana atelier.
2. When answering about products, ALWAYS include the product name, price, fabric, and a direct link to the product page.
3. Product page links format: [Product Name](product.html?id={slug}) (or https://www.missrezanna.com/product.html?id={slug})
4. Answer specific questions about fabrics (Mulberry Silk, Chanderi, Organic Cotton Silk), colors, fit, and sizes.
5. If customer asks for recommendations (e.g. for a wedding, gift, office, or festive occasion), suggest 2-3 specific matching products from the catalog with prices.
6. For bespoke/custom orders, direct customers to WhatsApp (+91 98773 27186): https://wa.me/919877327186
7. Keep responses concise, elegant, and directly helpful (1-3 short paragraphs).
8. Use ✦ or ❖ sparingly for royal aesthetic formatting.
9. You can understand and respond in English, Hindi, Punjabi, or any language the customer uses.
10. Never invent products that do not exist in the catalog.
`;

function buildCatalogFromDefault() {
    let context = `\n## PRODUCT CATALOG (${DEFAULT_PRODUCTS.length} products)\n\n`;
    for (const p of DEFAULT_PRODUCTS) {
        context += `### ${p.name}\n`;
        context += `- **Slug**: ${p.slug}\n`;
        context += `- **Product Page**: product.html?id=${p.slug}\n`;
        context += `- **Price**: ₹${p.price.toLocaleString('en-IN')}\n`;
        context += `- **Category**: ${p.category}\n`;
        context += `- **Fabric**: ${p.fabric}\n`;
        context += `- **Fit**: ${p.fit}\n`;
        context += `- **Sizes Available**: ${p.sizes}\n`;
        context += `- **Description**: ${p.description}\n\n`;
    }
    return context;
}

/**
 * Fetches products from the database (with 2-second timeout)
 * and falls back to DEFAULT_PRODUCTS if DB is cold or unreachable.
 * Results cached in memory for 5 minutes.
 */
async function getProductContext() {
    const now = Date.now();
    if (cachedProductContext && (now - cacheTimestamp) < CACHE_TTL_MS) {
        return cachedProductContext;
    }

    try {
        // Query database with a 2-second timeout to never block serverless responses
        const dbQuery = prisma.product.findMany({
            where: { status: 'active' },
            include: {
                category: { select: { name: true } },
                variants: {
                    select: {
                        size: true,
                        color: true,
                        inventory: { select: { stock: true, reservedStock: true } }
                    }
                },
                attributes: { select: { attributeName: true, attributeValue: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 30
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('DB query timeout')), 2000)
        );

        const products = await Promise.race([dbQuery, timeoutPromise]);

        if (products && products.length > 0) {
            let context = `\n## PRODUCT CATALOG (${products.length} products from database)\n\n`;
            for (const product of products) {
                const price = Number(product.price);
                const salePrice = product.salePrice ? Number(product.salePrice) : null;
                const displayPrice = salePrice
                    ? `₹${salePrice.toLocaleString('en-IN')} (was ₹${price.toLocaleString('en-IN')})`
                    : `₹${price.toLocaleString('en-IN')}`;

                const sizeInfo = product.variants.map(v => {
                    const available = v.inventory ? (v.inventory.stock - v.inventory.reservedStock) : 0;
                    return `${v.size || 'Standard'}: ${available > 0 ? `${available} in stock` : 'available'}`;
                }).join(', ');

                context += `### ${product.name}\n`;
                context += `- **Slug**: ${product.slug}\n`;
                context += `- **Product Page**: product.html?id=${product.slug}\n`;
                context += `- **Category**: ${product.category?.name || 'Collection'}\n`;
                context += `- **Price**: ${displayPrice}\n`;
                if (product.fabric) context += `- **Fabric**: ${product.fabric}\n`;
                if (product.fit) context += `- **Fit**: ${product.fit}\n`;
                if (product.shortDescription) context += `- **Summary**: ${product.shortDescription}\n`;
                if (sizeInfo) context += `- **Sizes**: ${sizeInfo}\n`;
                context += `\n`;
            }

            cachedProductContext = context;
            cacheTimestamp = now;
            return context;
        }
    } catch (err) {
        logger.warn('[ChatService] Database query bypassed or timed out, using comprehensive catalog context:', err.message);
    }

    // Use default comprehensive catalog
    cachedProductContext = buildCatalogFromDefault();
    cacheTimestamp = now;
    return cachedProductContext;
}

/**
 * Sends a message to Google Gemini with full brand + product context
 * and returns the AI-generated response.
 */
async function chat(userMessage, conversationHistory = []) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        logger.warn('[ChatService] GEMINI_API_KEY not configured. Using fallback response.');
        return getFallbackResponse(userMessage);
    }

    try {
        const productContext = await getProductContext();
        const systemInstruction = BRAND_SYSTEM_PROMPT + productContext;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 600,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
        });

        const chatSession = model.startChat({
            history: conversationHistory,
        });

        const result = await chatSession.sendMessage(userMessage);
        const response = result.response.text();

        return response;

    } catch (error) {
        logger.error('[ChatService] Gemini API error:', error.message);

        if (error.message?.includes('429') || error.message?.includes('quota')) {
            return 'Our atelier assistant is currently experiencing high demand. For immediate assistance, please connect with our stylists on <a href="https://wa.me/919877327186" target="_blank">WhatsApp (+91 98773 27186)</a>. ✦';
        }

        return getFallbackResponse(userMessage);
    }
}

/**
 * Provides helpful response when Gemini API is offline.
 */
function getFallbackResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('ship') || q.includes('deliver') || q.includes('courier')) {
        return 'We offer <strong>complimentary express shipping</strong> across India on orders over ₹15,000. Ready-to-wear pieces dispatch in 2–4 business days via insured courier. ✦';
    }
    if (q.includes('size') || q.includes('fit') || q.includes('measurement')) {
        return 'Our garments are available in sizes XS through 6XL with a relaxed luxury drape. For bespoke tailoring, connect with our artisans on <a href="https://wa.me/919877327186" target="_blank">WhatsApp (+91 98773 27186)</a>. ✦';
    }
    if (q.includes('return') || q.includes('exchange') || q.includes('refund')) {
        return 'We offer <strong>7-day hassle-free size exchanges</strong> on unworn garments with tags attached, and a 14-day return window. ✦';
    }
    if (q.includes('navy') || q.includes('kurta')) {
        return 'Our <strong>Navy Blue Floral Embroidered Kurta Pant Set</strong> (₹4,500) features delicate multicolor embroidery and matching straight pants. <a href="product.html?id=navy-blue-embroidered-kurta-pant-set">✦ View Product Details</a>';
    }

    return 'Thank you for reaching out to the MISS REZANNA atelier! Our fashion consultants are available for personal styling and sizing advice on <a href="https://wa.me/919877327186?text=' + encodeURIComponent('Hello MISS REZANNA, ' + query) + '" target="_blank">✦ WhatsApp (+91 98773 27186)</a>.';
}

module.exports = { chat };
