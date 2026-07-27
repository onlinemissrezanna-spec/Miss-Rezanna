const API_BASE_URL = 'https://miss-rezanna-production.up.railway.app/api/v1';

// Global cache for products
let productCatalog = null;

// Fetch all products from the live database
async function fetchProducts() {
    if (productCatalog) return productCatalog;

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        // Convert array to object keyed by slug (to maintain compatibility with existing frontend logic)
        const catalog = {};
        if (data.data && Array.isArray(data.data.products)) {
            data.data.products.forEach(product => {
                catalog[product.slug] = {
                    id: product.id,
                    name: product.name,
                    price: `₹ ${product.basePrice}`,
                    images: product.images ? JSON.parse(product.images) : [],
                    label: product.features ? JSON.parse(product.features)[0] : '',
                    description: product.description,
                    variants: product.variants
                };
            });
        }
        productCatalog = catalog;
        return catalog;
    } catch (error) {
        console.error('Failed to fetch products from live database:', error);
        return {};
    }
}

// Ensure it's available globally for other scripts
window.fetchProducts = fetchProducts;
