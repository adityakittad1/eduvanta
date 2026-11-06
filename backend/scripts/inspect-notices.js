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

async function run() {
  const { data, error } = await sb.from('notices').select('id, title, content, target_audience, created_at').order('created_at', { ascending: false }).limit(20);
  if (error) {
    console.error('Error fetching notices:', error);
    return;
  }
  console.log('Most recent 20 notices:');
  for (const n of data) {
    console.log(`- [${n.id}] "${n.title}" (${n.created_at}) -> "${n.content?.slice(0, 30)}"`);
  }
}
run();
