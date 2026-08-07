const https = require('https');

function postLogin() {
  const postData = JSON.stringify({ email: 'admin@missrezanna.com', password: 'admin123' });

  const req = https.request('https://www.missrezanna.com/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Login Status: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Body: ${data}`);
    });
  });

  req.on('error', (err) => console.log('Req error:', err.message));
  req.write(postData);
  req.end();
}

postLogin();
