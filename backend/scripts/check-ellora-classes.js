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

async function checkElloraClassesAndSubjects() {
  const ELLORA_ID = 'cmukd0qpd0000zytnolrlhqd3';
  const { data: classes } = await sb.from('classes').select('id, name, division').eq('school_id', ELLORA_ID);
  const { data: subjects } = await sb.from('subjects').select('id, name, code').eq('school_id', ELLORA_ID);

  console.log('Ellora Classes:', classes);
  console.log('Ellora Subjects:', subjects);
}

checkElloraClassesAndSubjects();

