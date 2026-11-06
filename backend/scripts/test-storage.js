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

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY);

async function createBucket() {
  const createRes = await sb.storage.createBucket('eduvanta-assets', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  });
  console.log('Create bucket result:', createRes);

  const { data: buckets } = await sb.storage.listBuckets();
  console.log('Buckets after create:', buckets);

  const testBuf = Buffer.from('test file upload content');
  const res = await sb.storage.from('eduvanta-assets').upload('test/hello.txt', testBuf, {
    contentType: 'text/plain',
    upsert: true
  });
  console.log('Upload test result:', res);
}
createBucket();
