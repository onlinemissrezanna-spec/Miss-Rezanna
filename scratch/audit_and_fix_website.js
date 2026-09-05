const fs = require('fs');
const path = require('path');

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

console.log('=== STARTING FULL WEBSITE AUDIT & FIXES ===\n');

let issuesFound = 0;
let fixesApplied = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  console.log(`Auditing ${file}...`);

  // 1. Check for rel="noopener noreferrer" on target="_blank" links
  const targetBlankMatches = content.match(/<a\s+[^>]*target="_blank"[^>]*>/gi) || [];
  targetBlankMatches.forEach(tag => {
    if (!tag.includes('rel=') || (!tag.includes('noopener') && !tag.includes('noreferrer'))) {
      issuesFound++;
      if (tag.includes('rel="')) {
        const newTag = tag.replace('rel="', 'rel="noopener noreferrer ');
        content = content.replace(tag, newTag);
      } else if (tag.includes("rel='")) {
        const newTag = tag.replace("rel='", "rel='noopener noreferrer ");
        content = content.replace(tag, newTag);
      } else {
        const newTag = tag.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"');
        content = content.replace(tag, newTag);
      }
      fixesApplied++;
    }
  });

  // 2. Add missing meta keywords if missing
  if (!content.includes('name="keywords"')) {
    issuesFound++;
    let kw = 'Miss Rezanna, luxury ethnic wear, Indian kurti sets, Ludhiana fashion';
    if (file.includes('blog')) kw = 'Miss Rezanna blog, kurti styling tips, ethnic fashion guide';
    if (file.includes('privacy')) kw = 'Miss Rezanna privacy policy, customer data protection';
    if (file.includes('terms')) kw = 'Miss Rezanna terms and conditions, shipping returns policy';
    
    const kwTag = `  <meta name="keywords" content="${kw}">`;
    if (content.includes('<!-- Fonts -->')) {
      content = content.replace('<!-- Fonts -->', `${kwTag}\n  <!-- Fonts -->`);
    } else {
      content = content.replace('</head>', `${kwTag}\n</head>`);
    }
    fixesApplied++;
  }

  // 3. Add favicon link if missing
  if (!content.includes('rel="icon"') && !content.includes('rel="shortcut icon"')) {
    issuesFound++;
    const faviconTag = `  <link rel="icon" type="image/png" href="images/logo.png">\n  <link rel="apple-touch-icon" href="images/logo.png">`;
    if (content.includes('<!-- Fonts -->')) {
      content = content.replace('<!-- Fonts -->', `${faviconTag}\n  <!-- Fonts -->`);
    } else {
      content = content.replace('</head>', `${faviconTag}\n</head>`);
    }
    fixesApplied++;
  }

  // 4. Add Twitter Card meta tags if missing
  if (!content.includes('name="twitter:card"')) {
    issuesFound++;
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'MISS REZANNA';
    const twitterTags = `  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="Thoughtfully crafted for women who appreciate timeless elegance, refined craftsmanship and everyday luxury.">
  <meta name="twitter:image" content="https://www.missrezanna.com/images/logo.png">`;
    content = content.replace('</head>', `${twitterTags}\n</head>`);
    fixesApplied++;
  }

  // 5. Add loading="lazy" to non-hero images missing loading attribute
  const imgMatches = content.match(/<img\s+[^>]*>/gi) || [];
  imgMatches.forEach((imgTag, idx) => {
    if (idx > 1 && !imgTag.includes('loading=')) {
      issuesFound++;
      const newImgTag = imgTag.replace('<img ', '<img loading="lazy" ');
      content = content.replace(imgTag, newImgTag);
      fixesApplied++;
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`  ✓ Updated and saved ${file}`);
  } else {
    console.log(`  ✓ No issues found in ${file}`);
  }
});

console.log(`\n=== AUDIT COMPLETE ===`);
console.log(`Total Potential Issues Identified: ${issuesFound}`);
console.log(`Total Automatic Fixes Applied: ${fixesApplied}`);
