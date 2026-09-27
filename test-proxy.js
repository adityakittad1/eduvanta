const http = require('http');

const data = JSON.stringify({ email: 'principal@zpschool1.in', password: 'Principal@123' });

const options = {
  hostname: '127.0.0.1',
  port: 5173,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Host': 'trimalpur.localhost:5173',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
