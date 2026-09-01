const fs = require('fs');

console.log('=== APPLYING RICH SCHEMAS & CLEAN OG:URL FOR FAST GOOGLE INDEXING ===\n');

// 1. Fix SearchAction URL in index.html
if (fs.existsSync('index.html')) {
  let content = fs.readFileSync('index.html', 'utf8');
  content = content.replace('collection.html?q=', 'collection?q=');
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Updated index.html WebSite schema search action.');
}

// 2. Add Product JSON-LD Schema to product.html
if (fs.existsSync('product.html')) {
  let content = fs.readFileSync('product.html', 'utf8');
  if (!content.includes('"@type": "Product"')) {
    const productSchema = `  <!-- Product Schema JSON-LD for Google Rich Snippets -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "Navy Blue Floral Embroidered Kurta Pant Set",
    "image": [
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-1.png",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-2.png",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-3.png",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-4.jpg",
      "https://www.missrezanna.com/images/navy-blue-embroidered-kurta-pant-set-5.jpg"
    ],
    "description": "A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.",
    "sku": "MR-KU-001",
    "mpn": "MR-KU-001",
    "brand": {
      "@type": "Brand",
      "name": "MISS REZANNA"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://www.missrezanna.com/product?id=navy-blue-embroidered-kurta-pant-set",
      "priceCurrency": "INR",
      "price": "4500",
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "MISS REZANNA"
      }
    }
  }
  </script>
`;
    content = content.replace('</head>', `${productSchema}</head>`);
    fs.writeFileSync('product.html', content, 'utf8');
    console.log('Added Product Schema to product.html');
  }
}

// 3. Fix og:url in all HTML files to match clean canonical URLs
const ogUrlMap = {
  'index.html': 'https://www.missrezanna.com/',
  'collection.html': 'https://www.missrezanna.com/collection',
  'product.html': 'https://www.missrezanna.com/product?id=navy-blue-embroidered-kurta-pant-set',
  'about.html': 'https://www.missrezanna.com/about',
  'contact.html': 'https://www.missrezanna.com/contact',
  'journal.html': 'https://www.missrezanna.com/journal',
  'blog-1.html': 'https://www.missrezanna.com/blog-1',
  'blog-2.html': 'https://www.missrezanna.com/blog-2',
  'blog-3.html': 'https://www.missrezanna.com/blog-3',
  'exhibitions.html': 'https://www.missrezanna.com/exhibitions',
  'privacy-policy.html': 'https://www.missrezanna.com/privacy-policy',
  'terms-conditions.html': 'https://www.missrezanna.com/terms-conditions'
};

Object.keys(ogUrlMap).forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const targetUrl = ogUrlMap[file];

  content = content.replace(/<meta property="og:url" content=".*?">/gi, `<meta property="og:url" content="${targetUrl}">`);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated og:url for ${file} -> ${targetUrl}`);
});

console.log('Finished updating SEO schema & og:url tags.');
