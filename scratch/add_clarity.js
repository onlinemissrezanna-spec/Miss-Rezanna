const fs = require('fs');
const path = require('path');

const claritySnippet = `  <!-- Microsoft Clarity Analytics -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "y7axoaay98");
  </script>
</head>`;

const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Check if clarity snippet is already added
  if (!content.includes('y7axoaay98')) {
    if (content.includes('</head>')) {
      content = content.replace('</head>', claritySnippet);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added Clarity script to ${file}`);
      updatedCount++;
    } else {
      console.warn(`Could not find </head> tag in ${file}`);
    }
  } else {
    console.log(`Clarity script already exists in ${file}`);
  }
});

console.log(`Finished updating ${updatedCount} HTML files.`);
