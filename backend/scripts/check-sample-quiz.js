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

async function checkSample() {
  const { data: qd } = await sb.from('quiz_definitions').select('*').limit(1);
  console.log('quiz_definitions sample:', qd);
  const { data: qq } = await sb.from('quiz_questions').select('*').limit(1);
  console.log('quiz_questions sample:', qq);
}
checkSample();
