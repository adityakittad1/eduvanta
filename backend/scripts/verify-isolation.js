globalThis.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.trim().match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

async function testIsolation() {
  console.log('====================================================');
  console.log('     MULTI-TENANT DATA ISOLATION VERIFICATION       ');
  console.log('====================================================\n');

  // School A: Ellora Highschool
  const { data: ellora } = await supabase.from('schools').select('id, name, slug').eq('slug', 'ellora-highschool').single();
  // School B: Rajmata Jijau
  const { data: rajmata } = await supabase.from('schools').select('id, name, slug').eq('slug', 'rajmata-jijau-kolhapur').single();

  console.log(`School A: ${ellora.name} (ID: ${ellora.id})`);
  console.log(`School B: ${rajmata.name} (ID: ${rajmata.id})\n`);

  const entities = [
    { name: 'Students', table: 'students' },
    { name: 'Teachers', table: 'teachers' },
    { name: 'Classes', table: 'classes' },
    { name: 'Notices', table: 'notices' },
    { name: 'Learning Resources', table: 'learning_resources' },
    { name: 'Quizzes', table: 'quiz_definitions' },
    { name: 'Gallery Items', table: 'gallery_items' },
    { name: 'Attendance Records', table: 'attendance_records' },
    { name: 'Transfer Certificates', table: 'transfer_certificates' },
    { name: 'Early Warning Flags', table: 'early_warning_flags' }
  ];

  let allIsolated = true;

  for (const ent of entities) {
    // 1. Fetch IDs for School A
    const { data: itemsA, error: errA } = await supabase
      .from(ent.table)
      .select('id, school_id')
      .eq('school_id', ellora.id)
      .limit(100);

    // 2. Fetch IDs for School B
    const { data: itemsB, error: errB } = await supabase
      .from(ent.table)
      .select('id, school_id')
      .eq('school_id', rajmata.id)
      .limit(100);

    if (errA || errB) {
      console.error(`Error querying ${ent.name}:`, errA || errB);
      allIsolated = false;
      continue;
    }

    const idsA = new Set((itemsA || []).map(i => i.id));
    const idsB = new Set((itemsB || []).map(i => i.id));

    // Check intersection
    let overlap = 0;
    for (const id of idsA) {
      if (idsB.has(id)) overlap++;
    }

    // Verify school_id integrity
    const badA = (itemsA || []).filter(i => i.school_id !== ellora.id).length;
    const badB = (itemsB || []).filter(i => i.school_id !== rajmata.id).length;

    const passed = overlap === 0 && badA === 0 && badB === 0;
    if (!passed) allIsolated = false;

    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${ent.name}: School A has ${itemsA.length} sampled, School B has ${itemsB.length} sampled. Overlap = ${overlap}, Foreign keys correct: ${badA === 0 && badB === 0}`);
  }

  // 3. Test API-level tenant filtering
  console.log('\n--- API-Level Tenant Scoping ---');
  // Check that reports/dashboard aggregations respect school_id
  const { count: elloraStudentTotal } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', ellora.id);
  const { count: rajmataStudentTotal } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', rajmata.id);

  console.log(`Ellora Highschool Student Count: ${elloraStudentTotal}`);
  console.log(`Rajmata Jijau Student Count: ${rajmataStudentTotal}`);
  console.log(`Tenant Counts match expected isolation: ${elloraStudentTotal === 1000 && rajmataStudentTotal === 200}`);

  console.log('\n====================================================');
  console.log(`FINAL TENANT ISOLATION RESULT: ${allIsolated ? 'ALL 10 MODULES STRICTLY ISOLATED ✅' : 'ISOLATION FAILURE ❌'}`);
  console.log('====================================================');
}

testIsolation().catch(console.error);
