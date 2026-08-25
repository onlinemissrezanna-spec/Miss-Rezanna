const fs = require('fs');

const gtmBodySnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KPMHRF2M"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('ns.html?id=GTM-KPMHRF2M')) {
    // Match <body> or <body ...>
    if (/<body[^>]*>/i.test(content)) {
      content = content.replace(/(<body[^>]*>)/i, `$1\n  ${gtmBodySnippet}`);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added GTM Body script to ${file}`);
      updatedCount++;
    } else {
      console.warn(`Could not find <body> tag in ${file}`);
    }
  } else {
    console.log(`GTM Body script already exists in ${file}`);
  }
});

console.log(`Finished updating ${updatedCount} HTML files with GTM Body tag.`);
