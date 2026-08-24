const fs = require('fs');

const canonicalMap = {
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

const noindexFiles = ['cart.html', 'admin.html'];

console.log('--- UPDATING HTML CANONICAL TAGS AND ROBOTS META ---');

Object.keys(canonicalMap).forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const targetCanonical = canonicalMap[file];
  const canonicalTag = `  <link rel="canonical" href="${targetCanonical}">`;

  // Remove existing canonical tags
  content = content.replace(/\s*<link rel="canonical"[^>]*>/gi, '');

  // Add canonical tag right after <head> or before Microsoft Clarity / stylesheets
  if (content.includes('<!-- Fonts -->')) {
    content = content.replace('<!-- Fonts -->', `${canonicalTag}\n  <!-- Fonts -->`);
  } else if (content.includes('</head>')) {
    content = content.replace('</head>', `${canonicalTag}\n</head>`);
  }

  // Ensure index, follow meta tag exists
  if (!content.includes('name="robots"')) {
    content = content.replace('</head>', `  <meta name="robots" content="index, follow">\n</head>`);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated canonical for ${file} -> ${targetCanonical}`);
});

noindexFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\s*<link rel="canonical"[^>]*>/gi, '');
  content = content.replace(/\s*<meta name="robots"[^>]*>/gi, '');
  content = content.replace('</head>', `  <meta name="robots" content="noindex, nofollow">\n</head>`);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated noindex, nofollow for ${file}`);
});
