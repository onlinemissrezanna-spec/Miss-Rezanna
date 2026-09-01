const fs = require('fs');

const ga4Snippet = `  <!-- Google Analytics 4 (GA4) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-30CWXSKXT7"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-30CWXSKXT7');
  </script>`;

const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('G-30CWXSKXT7')) {
    if (content.includes('</head>')) {
      content = content.replace('</head>', `${ga4Snippet}\n</head>`);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added GA4 script to ${file}`);
      updatedCount++;
    } else {
      console.warn(`Could not find </head> tag in ${file}`);
    }
  } else {
    console.log(`GA4 script already exists in ${file}`);
  }
});

console.log(`Finished updating ${updatedCount} HTML files with GA4 ID G-30CWXSKXT7.`);
