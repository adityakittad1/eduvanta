const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(line => line.includes('=') && !line.trim().startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      return [key, val];
    })
);

const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await sb
    .from('gallery_items')
    .select('id, title, category, file_url, is_public')
    .eq('school_id', 'cmukd0qpd0000zytnolrlhqd3')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Total count:', data.length);
    console.log('Last 10:');
    data.slice(-10).forEach((d, i) => console.log(i + 1, d.title, d.file_url));
  }
}

check();
