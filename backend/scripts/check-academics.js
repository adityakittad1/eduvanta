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

async function checkAcademics() {
  const { data: assessments, error: aErr } = await sb
    .from('assessments')
    .select('id, school_id, name, type, max_marks, class_id, subject_id');

  const { data: records, error: rErr } = await sb
    .from('academic_records')
    .select('id, school_id, marks_obtained');

  if (aErr) console.error('Assessment err:', aErr);
  if (rErr) console.error('Record err:', rErr);

  console.log(`Total assessments in DB: ${assessments ? assessments.length : 0}`);
  console.log(`Total academic records in DB: ${records ? records.length : 0}`);

  if (assessments && assessments.length > 0) {
    console.log('Sample assessments:', assessments.slice(0, 3));
  }
}

checkAcademics();

