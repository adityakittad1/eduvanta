const http = require('http');

const data = JSON.stringify({
  admissionNumber: 'TEST-001',
  firstName: 'Test',
  lastName: 'Student',
  academicYear: '2026-2027',
  dateOfBirth: '2010-01-01T00:00:00.000Z',
  gender: 'MALE'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/students',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
    // We need auth header for this...
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', console.error);
req.write(data);
req.end();
