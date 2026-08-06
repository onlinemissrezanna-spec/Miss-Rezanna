const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Body preview: ${data.substring(0, 150)}\n---`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`URL: ${url}`);
      console.log(`Error: ${err.message}\n---`);
      resolve();
    });
  });
}

async function run() {
  await testUrl('https://www.missrezanna.com/health');
  await testUrl('https://www.missrezanna.com/api/v1/health');
  await testUrl('https://miss-rezanna-production.up.railway.app/health');
  await testUrl('https://miss-rezanna-production.up.railway.app/api/v1/health');
}

run();
