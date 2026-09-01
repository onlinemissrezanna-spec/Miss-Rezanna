const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

console.log('=== WEBSITE META TAGS & KEYWORDS AUDIT ===\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  const descMatch = content.match(/<meta\s+name="description"\s+content="(.*?)"/i);
  const kwMatch = content.match(/<meta\s+name="keywords"\s+content="(.*?)"/i);

  console.log(`FILE: ${file}`);
  console.log(`  Title: ${titleMatch ? titleMatch[1] : 'N/A'}`);
  console.log(`  Description: ${descMatch ? descMatch[1] : 'N/A'}`);
  console.log(`  Keywords: ${kwMatch ? kwMatch[1] : 'None specified in meta tag'}\n`);
});
