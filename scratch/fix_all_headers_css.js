const fs = require('fs');

const standardCssBlock = `  <!-- Core Design System CSS -->
  <link rel="stylesheet" href="css/variables.css?v=5.0">
  <link rel="stylesheet" href="css/typography.css?v=5.0">
  <link rel="stylesheet" href="css/spacing.css?v=5.0">
  <link rel="stylesheet" href="css/animations.css?v=5.0">
  <link rel="stylesheet" href="css/components.css?v=5.0">
  <link rel="stylesheet" href="css/hero.css?v=5.0">
  <link rel="stylesheet" href="css/mobile-nav.css?v=5.0">
  <link rel="stylesheet" href="css/footer.css?v=5.0">
  <link rel="stylesheet" href="css/cookie-consent.css?v=5.0">
  <link rel="stylesheet" href="css/luxury-dynamics.css?v=5.0">
  <link rel="stylesheet" href="css/ethnic-story.css?v=5.0">
  <link rel="stylesheet" href="css/luxury-chatbot.css?v=5.0">
  <link rel="stylesheet" href="css/indian-ai-model.css?v=5.0">
  <link rel="stylesheet" href="css/customer-auth.css?v=5.0">`;

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace style.css or incomplete css blocks in head
  if (file === 'index.html') {
    // Keep page-specific css for index.html while ensuring core css is explicitly present
    content = content.replace(/<link rel="stylesheet" href="css\/style\.css[^">]*>/g, standardCssBlock);
  } else if (file === 'collection.html') {
    content = content.replace(/<!-- Core Design System CSS[\s\S]*?(?=<script src="https:\/\/unpkg\.com\/lucide)/g, standardCssBlock + '\n  <link rel="stylesheet" href="css/collection-page.css?v=5.0">\n\n  ');
  } else if (file === 'product.html') {
    content = content.replace(/<link rel="stylesheet" href="css\/style\.css[\s\S]*?(?=<script src="https:\/\/unpkg\.com\/lucide)/g, standardCssBlock + '\n  <link rel="stylesheet" href="css/product.css?v=5.0">\n\n  ');
  } else {
    content = content.replace(/<link rel="stylesheet" href="css\/style\.css[\s\S]*?(?=<script src="https:\/\/unpkg\.com\/lucide)/g, standardCssBlock + '\n\n  ');
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated CSS links in ${file}`);
});
