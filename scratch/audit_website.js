const fs = require('fs');
const path = require('path');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

console.log(`Auditing ${htmlFiles.length} HTML files...`);

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n--- Auditing ${file} ---`);

  // Check script tags
  if (!content.includes('customer-auth.js')) {
    console.warn(`[WARNING] ${file} is missing customer-auth.js!`);
  }
  if (!content.includes('main.js') && file !== 'admin.html') {
    console.warn(`[WARNING] ${file} is missing main.js!`);
  }

  // Check old broken product links
  if (content.includes('product.html?id=ethereal-kurti') || content.includes('product.html?id=midnight-kurti') || content.includes('product.html?id=ivory-fusion')) {
    console.warn(`[NOTICE] ${file} contains old archived product ID links.`);
  }

  // Check social links
  if (content.includes('site-footer') || content.includes('footer')) {
    if (!content.includes('instagram.com/miss_rezanna')) {
      console.warn(`[WARNING] ${file} footer is missing updated Instagram link!`);
    }
  }
});
