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

async function checkPublicEnabled() {
  const { data, error } = await sb
    .from('schools')
    .select('id, name, slug, is_active, is_public_enabled');

  if (error) {
    console.error(error);
    return;
  }

  console.log('Schools count:', data.length);
  data.forEach(s => {
    console.log(`- ${s.name} (slug: ${s.slug}) | active: ${s.is_active} | publicEnabled: ${s.is_public_enabled}`);
  });
}

checkPublicEnabled();

