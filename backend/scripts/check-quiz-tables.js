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

async function checkTables() {
  const [qDef, qQ, qBank] = await Promise.all([
    sb.from('quiz_definitions').select('id', { count: 'exact', head: true }),
    sb.from('quiz_questions').select('id', { count: 'exact', head: true }),
    sb.from('question_bank').select('id', { count: 'exact', head: true })
  ]);

  console.log('quiz_definitions count:', qDef.count, 'err:', qDef.error?.message);
  console.log('quiz_questions count:', qQ.count, 'err:', qQ.error?.message);
  console.log('question_bank count:', qBank.count, 'err:', qBank.error?.message);
}

checkTables();
