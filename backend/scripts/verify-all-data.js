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

async function checkAllSchools() {
  const { data: schools, error } = await supabase.from('schools').select('id, name, slug').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching schools:', error);
    return;
  }
  console.log('Total schools registered:', schools.length);

  const report = [];

  for (const school of schools) {
    const [
      { count: students },
      { count: teachers },
      { count: classes },
      { count: notices },
      { count: resources },
      { count: quizzes },
      { count: gallery },
      { count: attendance },
      { count: tcs },
      { count: flags },
      { count: assessments }
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('notices').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('learning_resources').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('quiz_definitions').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('gallery_items').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('transfer_certificates').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('early_warning_flags').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
      supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('school_id', school.id),
    ]);

    const info = {
      name: school.name,
      slug: school.slug,
      students: students || 0,
      teachers: teachers || 0,
      classes: classes || 0,
      notices: notices || 0,
      resources: resources || 0,
      quizzes: quizzes || 0,
      gallery: gallery || 0,
      attendance: attendance || 0,
      tcs: tcs || 0,
      flags: flags || 0,
      assessments: assessments || 0
    };
    report.push(info);

    console.log('----------------------------------------------------');
    console.log(`School: ${info.name} (${info.slug})`);
    console.log(`  Students: ${info.students}`);
    console.log(`  Teachers: ${info.teachers}`);
    console.log(`  Classes: ${info.classes}`);
    console.log(`  Notices: ${info.notices}`);
    console.log(`  Learning Resources: ${info.resources}`);
    console.log(`  Quizzes: ${info.quizzes}`);
    console.log(`  Gallery Photos: ${info.gallery}`);
    console.log(`  Attendance Records: ${info.attendance}`);
    console.log(`  Transfer Certificates: ${info.tcs}`);
    console.log(`  Early Warning Flags: ${info.flags}`);
    console.log(`  Assessments: ${info.assessments}`);
  }

  return report;
}

checkAllSchools().catch(console.error);
