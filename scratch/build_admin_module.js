const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'admin.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'js/admin.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/admin.css'), 'utf8');

// Replace CSS link/style and JS script tag with inline styles and inline scripts
const inlinedHtml = html
  .replace(/<style>[\s\S]*?<\/style>|<link rel="stylesheet" href="css\/admin\.css[^"]*">/, `<style>${css}</style>`)
  .replace(/<script>[\s\S]*?<\/script>|<script src="js\/admin\.js[^"]*"><\/script>/, `<script>${js}</script>`);

const content = `module.exports = ${JSON.stringify({ html: inlinedHtml, js, css }, null, 2)};`;

fs.writeFileSync(path.join(root, 'backend/src/adminHtmlContent.js'), content, 'utf8');
fs.writeFileSync(path.join(root, 'admin.html'), inlinedHtml, 'utf8');
console.log('adminHtmlContent.js and admin.html regenerated with inline JS & CSS successfully!');
