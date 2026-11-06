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

async function inspectAllSchools() {
  const { data: schools, error } = await sb
    .from('schools')
    .select('id, name, slug, is_active, principal_name, address')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching schools:', error);
    return;
  }

  console.log(`Total schools in database: ${schools.length}`);
  for (const s of schools) {
    const [fac, ach, gal, not] = await Promise.all([
      sb.from('school_facilities').select('id', { count: 'exact', head: true }).eq('school_id', s.id),
      sb.from('school_achievements').select('id', { count: 'exact', head: true }).eq('school_id', s.id),
      sb.from('gallery_items').select('id', { count: 'exact', head: true }).eq('school_id', s.id),
      sb.from('notices').select('id', { count: 'exact', head: true }).eq('school_id', s.id),
    ]);
    console.log(`- School: "${s.name}" | slug: "${s.slug}" | ID: ${s.id}`);
    console.log(`  Facilities: ${fac.count || 0} | Achievements: ${ach.count || 0} | Gallery: ${gal.count || 0} | Notices: ${not.count || 0}`);
  }
}

inspectAllSchools();

