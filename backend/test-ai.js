const http = require('http');

async function main() {
  const loginData = JSON.stringify({ email: 'shinde@gmail.com', password: 'Eduvanta@123' });

  const token = await new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData),
        'Host': 'ellora-highschool.localhost'
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(b);
          resolve(parsed.data.accessToken);
        } catch (e) {
          reject(new Error(b));
        }
      });
    });
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });

  console.log('✅ Logged in as Principal. Token obtained.');

  const questions = [
    'hi',
    'how many students do we have?',
    'tell me about student Aarav',
    'what are our campus facilities?'
  ];

  for (const q of questions) {
    const body = JSON.stringify({ prompt: q });
    await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/v1/ai/ask',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(body),
          'Host': 'ellora-highschool.localhost'
        }
      }, res => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => {
          console.log(`\n========================================`);
          console.log(`USER: "${q}"`);
          console.log(`========================================`);
          try {
            const parsed = JSON.parse(b);
            console.log(parsed.data?.response || b);
          } catch (e) {
            console.log(b);
          }
          resolve();
        });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}

main().catch(console.error);
