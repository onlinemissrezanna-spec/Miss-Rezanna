const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/admin.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/admin.css'), 'utf8');

const content = `module.exports = ${JSON.stringify({ html, js, css }, null, 2)};`;

fs.writeFileSync(path.join(root, 'backend/src/adminHtmlContent.js'), content, 'utf8');
console.log('adminHtmlContent.js created successfully!');
