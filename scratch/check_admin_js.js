const fs = require('fs');

const content = fs.readFileSync('admin.html', 'utf8');

// Extract all inline script blocks
const scripts = content.match(/<script>([\s\S]*?)<\/script>/gi) || [];

console.log(`Extracted ${scripts.length} inline script blocks from admin.html`);

scripts.forEach((scriptTag, idx) => {
  const code = scriptTag.replace(/<\/?script>/gi, '');
  try {
    new Function(code);
    console.log(`Script block #${idx + 1}: Syntax OK`);
  } catch (err) {
    console.error(`Syntax ERROR in Script block #${idx + 1}:`, err.message);
  }
});
