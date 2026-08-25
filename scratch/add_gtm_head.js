const fs = require('fs');

const gtmHeadSnippet = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KPMHRF2M');</script>
<!-- End Google Tag Manager -->`;

const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

let updatedCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('GTM-KPMHRF2M')) {
    if (content.includes('<head>')) {
      content = content.replace('<head>', `<head>\n  ${gtmHeadSnippet}`);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Added GTM Head script to ${file}`);
      updatedCount++;
    } else {
      console.warn(`Could not find <head> tag in ${file}`);
    }
  } else {
    console.log(`GTM Head script already exists in ${file}`);
  }
});

console.log(`Finished updating ${updatedCount} HTML files with GTM Head tag.`);
