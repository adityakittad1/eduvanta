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

const ELLORA_ID = 'cmukd0qpd0000zytnolrlhqd3';

async function testQuery() {
  const { data: rows, error } = await sb
    .from('assessments')
    .select('id, name, type, max_marks, class_id, subject_id, created_at')
    .eq('school_id', ELLORA_ID)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) console.error('Error:', error);
  else {
    console.log('Sample Ellora assessments from Supabase:');
    rows.forEach(r => console.log(`- [${r.type}] ${r.name} (Max: ${r.max_marks})`));
  }
}

testQuery();

