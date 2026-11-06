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

async function checkElloraAcademics() {
  const ELLORA_ID = 'cmukd0qpd0000zytnolrlhqd3';
  const { data: assessments, error } = await sb
    .from('assessments')
    .select('id, name, type, max_marks, class_id, subject_id')
    .eq('school_id', ELLORA_ID);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Ellora assessments count: ${assessments.length}`);
  if (assessments.length > 0) {
    console.log('Sample:', assessments.slice(0, 5));
  }
}

checkElloraAcademics();

