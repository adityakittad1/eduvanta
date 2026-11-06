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

const schoolId = 'cmukd0qpd0000zytnolrlhqd3';

async function testProfile() {
  const { data: school, error: sErr } = await sb.from('schools').select('*').eq('id', schoolId).maybeSingle();
  console.log('School query:', school?.name, sErr);

  const [
    { data: facilities, error: fErr },
    { data: achievements, error: aErr },
    { data: events, error: eErr },
    { count: studentCount, error: stErr },
    { count: teacherCount, error: tErr },
    { count: classCount, error: cErr },
  ] = await Promise.all([
    sb.from('school_facilities').select('*').eq('school_id', schoolId).order('name', { ascending: true }),
    sb.from('school_achievements').select('*').eq('school_id', schoolId).order('year', { ascending: false }),
    sb.from('school_events').select('*').eq('school_id', schoolId).order('event_date', { ascending: true }).limit(20),
    sb.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
    sb.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
    sb.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('is_active', true),
  ]);
  console.log('Counts:', { studentCount, teacherCount, classCount });
  console.log('Errors:', { fErr, aErr, eErr, stErr, tErr, cErr });
}
testProfile();
