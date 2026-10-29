const http = require('http');

const data = JSON.stringify({ email: 'shinde@gmail.com', password: 'Eduvanta@123' });

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Host': 'ellora-highschool.localhost'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(`Body: ${body}`));
});

req.on('error', (e) => console.error(`Problem: ${e.message}`));
req.write(data);
req.end();
