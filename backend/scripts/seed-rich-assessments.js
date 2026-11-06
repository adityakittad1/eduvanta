/**
 * Copyright (c) 2026 Aditya Kittad. All Rights Reserved.
 * Eduvanta - Multi-Tenant School ERP and Digital Campus Platform
 *
 * Seed Script: Rich Academic Assessments and Marks for Ellora High School (Fast Batch)
 */

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

async function seedAcademics() {
  console.log('Fetching classes, subjects, students...');
  const [classesRes, subjectsRes, studentsRes] = await Promise.all([
    sb.from('classes').select('id, name, division').eq('school_id', ELLORA_ID).limit(6),
    sb.from('subjects').select('id, name').eq('school_id', ELLORA_ID),
    sb.from('students').select('id, class_id').eq('school_id', ELLORA_ID).limit(100)
  ]);

  const classes = classesRes.data || [];
  const subjects = subjectsRes.data || [];
  const students = studentsRes.data || [];

  if (classes.length === 0 || subjects.length === 0) {
    console.error('Missing classes or subjects');
    return;
  }

  const subjectMap = new Map();
  subjects.forEach(s => subjectMap.set(s.name, s.id));

  const templates = [
    { name: 'Unit Test 1 - Mathematics', sub: 'Mathematics', type: 'UNIT_TEST', max: 25, d: '2026-07-20' },
    { name: 'Unit Test 1 - Science', sub: 'Science', type: 'UNIT_TEST', max: 25, d: '2026-07-22' },
    { name: 'Unit Test 1 - English', sub: 'English', type: 'UNIT_TEST', max: 25, d: '2026-07-24' },
    { name: 'Unit Test 1 - Marathi', sub: 'Marathi', type: 'UNIT_TEST', max: 25, d: '2026-07-26' },
    { name: 'Mid-Term Exam - Mathematics', sub: 'Mathematics', type: 'HALF_YEARLY', max: 80, d: '2026-09-15' },
    { name: 'Mid-Term Exam - Science', sub: 'Science', type: 'HALF_YEARLY', max: 80, d: '2026-09-17' },
    { name: 'Mid-Term Exam - English', sub: 'English', type: 'HALF_YEARLY', max: 80, d: '2026-09-19' },
    { name: 'Unit Test 2 - Mathematics', sub: 'Mathematics', type: 'UNIT_TEST', max: 25, d: '2026-10-18' },
    { name: 'Unit Test 2 - Science Practical', sub: 'Science', type: 'PRACTICAL', max: 30, d: '2026-10-20' },
    { name: 'Semester Final Mock - Mathematics', sub: 'Mathematics', type: 'ANNUAL', max: 100, d: '2026-11-04' }
  ];

  const nowIso = new Date().toISOString();
  const assessmentPayload = [];

  for (const cls of classes) {
    for (const tmpl of templates) {
      const subjectId = subjectMap.get(tmpl.sub) || subjects[0].id;
      const assessmentId = `casm${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`.slice(0, 25);
      assessmentPayload.push({
        id: assessmentId,
        school_id: ELLORA_ID,
        class_id: cls.id,
        subject_id: subjectId,
        name: `${tmpl.name} (${cls.name} ${cls.division || ''})`.trim(),
        type: tmpl.type,
        max_marks: tmpl.max,
        conducted_date: new Date(tmpl.d).toISOString(),
        academic_year: '2026-2027',
        created_at: new Date(tmpl.d).toISOString(),
        updated_at: nowIso
      });
    }
  }

  console.log(`Inserting ${assessmentPayload.length} assessments in batches...`);
  for (let i = 0; i < assessmentPayload.length; i += 20) {
    const chunk = assessmentPayload.slice(i, i + 20);
    const { error } = await sb.from('assessments').insert(chunk);
    if (error) console.error('Assessment batch error:', error.message);
  }

  // Generate marks for these assessments
  const marksPayload = [];
  for (const asm of assessmentPayload) {
    const classStudents = students.filter(s => s.class_id === asm.class_id);
    for (const st of classStudents) {
      const minMarks = Math.round(asm.max_marks * 0.45);
      const marks = Math.floor(Math.random() * (asm.max_marks - minMarks + 1)) + minMarks;
      const pct = (marks / asm.max_marks) * 100;
      const remarks = pct >= 85 ? 'Outstanding Performance' : pct >= 70 ? 'Very Good' : pct >= 50 ? 'Satisfactory' : 'Needs Improvement';
      marksPayload.push({
        id: `card${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`.slice(0, 25),
        school_id: ELLORA_ID,
        student_id: st.id,
        assessment_id: asm.id,
        marks_obtained: marks,
        remarks,
        created_at: asm.created_at,
        updated_at: nowIso
      });
    }
  }

  console.log(`Inserting ${marksPayload.length} marks records in batches...`);
  for (let i = 0; i < marksPayload.length; i += 50) {
    const chunk = marksPayload.slice(i, i + 50);
    const { error } = await sb.from('academic_records').insert(chunk);
    if (error) console.error('Marks batch error:', error.message);
  }

  const { count: finalAsmCount } = await sb.from('assessments').select('id', { count: 'exact', head: true }).eq('school_id', ELLORA_ID);
  const { count: finalRecCount } = await sb.from('academic_records').select('id', { count: 'exact', head: true }).eq('school_id', ELLORA_ID);

  console.log(`Done! Ellora High School now has ${finalAsmCount} assessments and ${finalRecCount} academic records.`);
}

seedAcademics().catch(console.error);
