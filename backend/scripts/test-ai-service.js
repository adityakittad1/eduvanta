const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const envFile = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#')).map(l => {
    const idx = l.indexOf('=');
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')];
  })
);

for (const [k, v] of Object.entries(env)) {
  process.env[k] = v;
}

const { getAuthorizedContext, processAiPrompt } = require('../dist/src/modules/ai/ai.service');

async function testAi() {
  const schoolId = 'cmukd0qpd0000zytnolrlhqd3';
  const user = { userId: '1', role: 'PRINCIPAL', name: 'Principal Sir', email: 'principal@ellora.edu' };
  
  console.log('Testing getAuthorizedContext...');
  const ctx = await getAuthorizedContext(schoolId, user);
  console.log('Context loaded:', !!ctx, ctx?.school?.name);

  console.log('Testing processAiPrompt for "hi"...');
  const res = await processAiPrompt('hi', schoolId, user);
  console.log('Response:', res);
}
testAi();
