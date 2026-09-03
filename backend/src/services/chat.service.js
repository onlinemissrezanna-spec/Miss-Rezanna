const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../config/db');
const logger = require('../utils/logger');

// ─── In-Memory Product Cache (refreshes every 5 minutes) ───
let cachedProductContext = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
- **WhatsApp**: +91 98773 27186
- **Email**: support@missrezanna.com
- **Instagram**: @miss_rezanna (https://www.instagram.com/miss_rezanna)

## SHIPPING & DELIVERY
- Complimentary express shipping across India on orders over ₹15,000
- Standard free shipping on all orders
- Ready-to-wear pieces dispatch in 2–4 business days
- Delivery via insured courier in 3–6 working days
- International shipping available on request via WhatsApp

## RETURNS & EXCHANGES
- 7-day hassle-free size exchanges on unworn garments with tags attached
- 14-day return window
- For artisanal defects or transit issues, contact within 48 hours of receipt
- Bespoke/custom orders are non-returnable

## SIZING
- Standard sizes: S, M, L, XL, 2XL, 3XL, 4XL, 5XL, 6XL
- Relaxed luxury drape designed for comfort
- For bespoke tailoring or exact measurements, recommend WhatsApp consultation

## PAYMENT
- Secure payments via Razorpay (UPI, Credit/Debit Cards, Net Banking, Wallets)
- Cash on Delivery available for select pincodes

## YOUR RESPONSE RULES
1. Be warm, professional, and luxurious in tone — like a high-end boutique stylist.
2. When recommending products, ALWAYS include the product name, price, and a clickable link to the product page.
3. Product page links follow this format: https://www.missrezanna.com/product.html?id={slug}
4. Mention specific details: fabric, fit, available sizes, and stock when relevant.
5. If a product is out of stock in a requested size, mention which sizes ARE available.
6. NEVER fabricate products, prices, or details that are not in the catalog provided below.
7. For bespoke/custom orders, direct customers to WhatsApp: https://wa.me/919877327186
8. Keep responses concise — under 150 words unless the customer asks for detailed information.
9. Use ✦ or ❖ sparingly for elegant formatting.
10. If the customer asks about something not in the catalog or beyond your knowledge, gracefully say you'll connect them with the atelier team and provide the WhatsApp link.
11. You may respond in Hindi, Punjabi, or any language the customer uses.
12. For order tracking or account-specific queries, direct them to log into their account or contact support.
`;

/**
 * Fetches all active products from the database and formats them as context for the AI.
 * Results are cached in memory for 5 minutes.
 */
async function getProductContext() {
    const now = Date.now();
    if (cachedProductContext && (now - cacheTimestamp) < CACHE_TTL_MS) {
        return cachedProductContext;
    }

    try {
        const products = await prisma.product.findMany({
            where: { status: 'active' },
            include: {
                category: { select: { name: true } },
                images: {
                    where: { isPrimary: true },
                    select: { imageUrl: true },
                    take: 1
                },
                variants: {
                    select: {
                        size: true,
                        color: true,
                        priceAdjustment: true,
                        inventory: {
                            select: { stock: true, reservedStock: true }
                        }
                    }
                },
                attributes: {
                    select: { attributeName: true, attributeValue: true }
                },
                tags: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!products || products.length === 0) {
            cachedProductContext = '\n## PRODUCT CATALOG\nNo products are currently available in the catalog.\n';
            cacheTimestamp = now;
            return cachedProductContext;
        }

        let context = `\n## PRODUCT CATALOG (${products.length} products)\n\n`;

        for (const product of products) {
            const price = Number(product.price);
            const salePrice = product.salePrice ? Number(product.salePrice) : null;
            const displayPrice = salePrice
                ? `₹${salePrice.toLocaleString('en-IN')} (was ₹${price.toLocaleString('en-IN')})`
                : `₹${price.toLocaleString('en-IN')}`;

            // Build size availability
            const sizeInfo = product.variants.map(v => {
                const available = v.inventory
                    ? (v.inventory.stock - v.inventory.reservedStock)
                    : 0;
                return `${v.size || 'Standard'}${v.color && v.color !== 'Standard' ? ` (${v.color})` : ''}: ${available > 0 ? `${available} in stock` : 'Out of stock'}`;
            }).join(', ');

            // Build attributes
            const attrs = product.attributes.map(a => `${a.attributeName}: ${a.attributeValue}`).join(', ');

            // Build tags
            const tags = product.tags.map(t => t.name).join(', ');

            context += `### ${product.name}\n`;
            context += `- **Slug**: ${product.slug}\n`;
            context += `- **Link**: https://www.missrezanna.com/product.html?id=${product.slug}\n`;
            context += `- **Category**: ${product.category?.name || 'Uncategorized'}\n`;
            context += `- **Price**: ${displayPrice}\n`;
            if (product.fabric) context += `- **Fabric**: ${product.fabric}\n`;
            if (product.fit) context += `- **Fit**: ${product.fit}\n`;
            if (product.shortDescription) context += `- **Summary**: ${product.shortDescription}\n`;
            if (product.careInstructions) context += `- **Care**: ${product.careInstructions}\n`;
            if (sizeInfo) context += `- **Size Availability**: ${sizeInfo}\n`;
            if (attrs) context += `- **Attributes**: ${attrs}\n`;
            if (tags) context += `- **Tags**: ${tags}\n`;
            if (product.isFeatured) context += `- **Featured**: Yes\n`;
            if (product.isNewArrival) context += `- **New Arrival**: Yes\n`;
            if (product.isBestSeller) context += `- **Bestseller**: Yes\n`;
            context += `\n`;
        }

        cachedProductContext = context;
        cacheTimestamp = now;
        logger.info(`[ChatService] Product context refreshed: ${products.length} products cached.`);
        return context;

    } catch (error) {
        logger.error('[ChatService] Failed to fetch products for AI context:', error.message);
        // Return stale cache if available, otherwise empty
        return cachedProductContext || '\n## PRODUCT CATALOG\nProduct catalog is temporarily unavailable.\n';
    }
}

/**
 * Sends a message to Google Gemini with full brand + product context
 * and returns the AI-generated response.
 *
 * @param {string} userMessage - The customer's message
 * @param {Array} conversationHistory - Previous messages [{role: 'user'|'model', parts: [{text}]}]
 * @returns {Promise<string>} - The AI response text
 */
async function chat(userMessage, conversationHistory = []) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        logger.warn('[ChatService] GEMINI_API_KEY not configured. Using fallback responses.');
        return getFallbackResponse(userMessage);
    }

    try {
        // Fetch fresh product context (cached for 5 min)
        const productContext = await getProductContext();

        // Build the full system instruction
        const systemInstruction = BRAND_SYSTEM_PROMPT + productContext;

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemInstruction,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 500,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
        });

        // Start a chat session with history
        const chatSession = model.startChat({
            history: conversationHistory,
        });

        // Send the user's message
        const result = await chatSession.sendMessage(userMessage);
        const response = result.response.text();

        logger.info(`[ChatService] AI responded successfully (${response.length} chars).`);
        return response;

    } catch (error) {
        logger.error('[ChatService] Gemini API error:', error.message);

        // If quota exceeded or rate limited, return a graceful fallback
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            return 'I apologize, our AI assistant is experiencing high demand right now. For immediate help, please reach out to our atelier team on <a href="https://wa.me/919877327186" target="_blank">WhatsApp (+91 98773 27186)</a>. They\'ll be delighted to assist you! ✦';
        }

        return getFallbackResponse(userMessage);
    }
}

/**
 * Provides basic keyword-based fallback when the Gemini API is unavailable.
 */
function getFallbackResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('ship') || q.includes('deliver') || q.includes('courier')) {
        return 'We offer <strong>complimentary express shipping</strong> across India on orders over ₹15,000. Ready-to-wear pieces dispatch in 2–4 business days, arriving within 3–6 working days via insured courier. ✦';
    }
    if (q.includes('size') || q.includes('fit') || q.includes('measurement')) {
        return 'Our garments are available in sizes S through 6XL with a relaxed luxury drape. For precise measurements or bespoke tailoring, <a href="https://wa.me/919877327186?text=Hello%20MISS%20REZANNA,%20I%20need%20sizing%20guidance" target="_blank">connect with our artisans on WhatsApp</a>. ✦';
    }
    if (q.includes('return') || q.includes('exchange') || q.includes('refund')) {
        return 'We offer <strong>7-day hassle-free size exchanges</strong> on unworn garments with tags attached, and a 14-day return window. For transit issues, contact us within 48 hours of receipt. ✦';
    }
    if (q.includes('price') || q.includes('cost') || q.includes('how much')) {
        return 'For detailed pricing on any of our pieces, please visit our <a href="https://www.missrezanna.com/collection.html">collection page</a> or ask me about a specific product! ✦';
    }

    return 'Thank you for reaching out to MISS REZANNA! Our AI assistant is currently being updated. For immediate, personalized help, our senior fashion consultants are available on <a href="https://wa.me/919877327186?text=' + encodeURIComponent('Hello MISS REZANNA, ' + query) + '" target="_blank">WhatsApp (+91 98773 27186)</a>. ✦';
}

module.exports = { chat };
