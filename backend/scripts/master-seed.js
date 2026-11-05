/**
 * master-seed.js
 * Comprehensive Idempotent Demonstration Data Generator for EduVanta ERP
 *
 * Populates:
 * 1. ELLORA HIGHSCHOOL (Primary Demonstration School)
 *    - 1,000 Students
 *    - 100 Teachers
 *    - Classes 5 to 10 (Divisions A, B, C, D)
 *    - Core Subjects (Marathi, English, Hindi, Mathematics, Science, Social Science)
 *    - 30 Days of Daily Attendance
 *    - Academic Assessments & Records
 *    - 30 Realistic Notices
 *    - 50 Learning Resources
 *    - 20 Quizzes with Questions & Options
 *    - 40 Gallery Photos
 *    - 15 Transfer Certificate Requests (5 Issued)
 *    - Early Warning Flags
 *    - School Profile, Facilities, Achievements & Events
 *
 * 2. Other 5 Maharashtra Demo Schools:
 *    - 200 Students each
 *    - 20 Teachers each
 *    - 10 Notices each
 *    - 15 Learning Resources each
 *    - 10 Quizzes each
 *    - 15 Gallery Photos each
 *    - Attendance & Academic Records
 */

globalThis.WebSocket = require('ws');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.trim().match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

function generateCuid() {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

// Authentic Maharashtrian Names Pool
const FIRST_NAMES_MALE = [
  'Aarav', 'Atharva', 'Omkar', 'Vedant', 'Pranav', 'Sarthak', 'Adwait', 'Rohit',
  'Rohan', 'Tejas', 'Mayur', 'Sagar', 'Yash', 'Nikhil', 'Varun', 'Kunal',
  'Akshay', 'Harsh', 'Gaurav', 'Sandeep', 'Sumit', 'Aditya', 'Abhishek', 'Suraj',
  'Kiran', 'Prathamesh', 'Chetan', 'Sanket', 'Sachin', 'Tushar', 'Ajinkya', 'Vaibhav',
  'Siddhesh', 'Ganesh', 'Mahesh', 'Vishal', 'Aniket', 'Amol', 'Dipak', 'Pravin',
  'Digambar', 'Swapnil', 'Santosh', 'Dattatray', 'Pramod', 'Vitthal', 'Maruti', 'Pandurang',
  'Bhausaheb', 'Rajesh', 'Subhash', 'Sudhir', 'Vijay', 'Anil', 'Ramesh', 'Shrikant'
];

const FIRST_NAMES_FEMALE = [
  'Sai', 'Ananya', 'Gauri', 'Shruti', 'Tanvi', 'Rutuja', 'Isha', 'Prajakta',
  'Sneha', 'Pooja', 'Swati', 'Pallavi', 'Shweta', 'Priyanka', 'Neha', 'Riya',
  'Mansi', 'Divya', 'Vaishnavi', 'Ashwini', 'Sonali', 'Komal', 'Prachi', 'Aishwarya',
  'Nikita', 'Madhuri', 'Anjali', 'Kavita', 'Manasi', 'Radha', 'Rupali', 'Sayali',
  'Sakshi', 'Bhakti', 'Siddhi', 'Shreya', 'Pranjal', 'Tejaswi', 'Namrata', 'Mayuri',
  'Shubhangi', 'Suvarna', 'Alka', 'Sunita', 'Ujjwala', 'Aparna', 'Vandana', 'Sarita'
];

const SURNAMES = [
  'Deshmukh', 'Patil', 'Jadhav', 'Kulkarni', 'Shinde', 'Pawar', 'More', 'Joshi',
  'Chavan', 'Gaikwad', 'Kadam', 'Bhosale', 'Wagh', 'Deshpande', 'Mane', 'Salunkhe',
  'Thorat', 'Jagtap', 'Sawant', 'Tambe', 'Mohite', 'Ghorpade', 'Nalawade', 'Khot',
  'Gharge', 'Ingale', 'Shingte', 'Kute', 'Shirke', 'Kale', 'Khade', 'Gade',
  'Suryavanshi', 'Choudhary', 'Raut', 'Mhaske', 'Gholap', 'Magar', 'Dumbre', 'Borade',
  'Bhandari', 'Gharat', 'Bhide', 'Ranade', 'Apte', 'Godbole', 'Kene', 'Gite'
];

const SUBJECT_LIST = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'Science', code: 'SCI' },
  { name: 'English', code: 'ENG' },
  { name: 'Marathi', code: 'MAR' },
  { name: 'Social Science', code: 'SOC' },
  { name: 'Hindi', code: 'HIN' },
];

const TEACHER_QUALIFICATIONS = [
  'M.Sc. Mathematics, B.Ed.',
  'M.A. Marathi Literature, B.Ed.',
  'M.Sc. Physics, B.Ed.',
  'M.A. English, B.Ed.',
  'M.Sc. Chemistry, B.Ed.',
  'M.A. History, B.Ed.',
  'B.Sc. Biology, B.Ed.',
  'B.P.Ed. Physical Education',
  'B.A. Hindi, D.Ed.',
  'M.Sc. Computer Science, B.Ed.',
];

async function runMasterSeed() {
  console.log('====================================================');
  console.log('       EDUVANTA MASTER DATA POPULATION SUITE        ');
  console.log('====================================================\n');

  const defaultPasswordHash = await bcrypt.hash('Eduvanta@123', 10);

  // 1. Fetch all registered schools
  const { data: schools, error: schoolErr } = await supabase.from('schools').select('*').order('name');
  if (schoolErr || !schools) {
    console.error('Failed to query schools:', schoolErr);
    return;
  }

  console.log(`Found ${schools.length} schools in database.`);

  const elloraSchool = schools.find(s => s.slug === 'ellora-highschool' || s.name.toLowerCase().includes('ellora'));
  if (!elloraSchool) {
    console.error('Critical: Could not locate ELLORA HIGHSCHOOL!');
    return;
  }

  const otherSchools = schools.filter(s => s.id !== elloraSchool.id && (
    s.slug.includes('pune') || s.slug.includes('nashik') || s.slug.includes('ahilyanagar') ||
    s.slug.includes('kolhapur') || s.slug.includes('gangapur')
  ));

  console.log(`Primary Demo School: ${elloraSchool.name} (${elloraSchool.slug})`);
  console.log(`Other Demo Schools (${otherSchools.length}): ${otherSchools.map(s => s.name).join(', ')}\n`);

  // ─── 2. SEED ELLORA HIGHSCHOOL (TARGET: 1000 STUDENTS, 100 TEACHERS) ───
  console.log('----------------------------------------------------');
  console.log('>>> [1/2] SEEDING ELLORA HIGHSCHOOL DATASET');
  console.log('----------------------------------------------------');
  await seedSchoolComplete(elloraSchool, {
    targetStudents: 1000,
    targetTeachers: 100,
    classesPerGrade: ['A', 'B', 'C', 'D'], // 6 grades * 4 divs = 24 sections
    grades: ['5', '6', '7', '8', '9', '10'],
    noticesCount: 30,
    resourcesCount: 50,
    quizzesCount: 20,
    galleryCount: 40,
    attendanceDays: 30,
    tcCount: 15,
    earlyWarningCount: 15,
    prefix: 'EH',
    defaultPasswordHash,
  });

  // ─── 3. SEED OTHER 5 DEMO SCHOOLS (TARGET: ~200 STUDENTS, 20 TEACHERS EACH) ───
  console.log('\n----------------------------------------------------');
  console.log('>>> [2/2] SEEDING OTHER 5 DEMO SCHOOLS');
  console.log('----------------------------------------------------');
  for (const s of otherSchools) {
    const pfx = s.slug.replace(/[^a-z0-9]/g, '').slice(0, 8);

    console.log(`\n• Processing School: ${s.name} (${s.slug})...`);
    await seedSchoolComplete(s, {
      targetStudents: 200,
      targetTeachers: 20,
      classesPerGrade: ['A', 'B'], // 6 grades * 2 divs = 12 sections
      grades: ['5', '6', '7', '8', '9', '10'],
      noticesCount: 10,
      resourcesCount: 15,
      quizzesCount: 10,
      galleryCount: 15,
      attendanceDays: 14,
      tcCount: 4,
      earlyWarningCount: 5,
      prefix: pfx,
      defaultPasswordHash,
    });
  }

  console.log('\n====================================================');
  console.log('   MASTER DATA POPULATION SUCCESSFULLY COMPLETED!   ');
  console.log('====================================================');
}

/**
 * Universal Idempotent School Data Generator
 */
async function seedSchoolComplete(school, config) {
  const schoolId = school.id;
  const now = new Date().toISOString();

  // A. Ensure Classes
  console.log('  1. Verifying Classes & Sections...');
  const existingClasses = await fetchAll('classes', { school_id: schoolId });
  const classMap = {}; // '5-A' -> id
  for (const c of existingClasses) {
    classMap[`${c.name}-${c.division}`] = c.id;
  }

  const classesToInsert = [];
  for (const g of config.grades) {
    for (const d of config.classesPerGrade) {
      const key = `${g}-${d}`;
      if (!classMap[key]) {
        const id = generateCuid();
        classMap[key] = id;
        classesToInsert.push({
          id,
          school_id: schoolId,
          name: g,
          division: d,
          academic_year: '2026-27',
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }
  if (classesToInsert.length > 0) {
    await batchInsert('classes', classesToInsert);
    console.log(`     + Created ${classesToInsert.length} new classes/sections.`);
  } else {
    console.log(`     ✓ All ${Object.keys(classMap).length} classes/sections already exist.`);
  }

  const allClassIds = Object.values(classMap);

  // B. Ensure Subjects
  console.log('  2. Verifying Core Subjects...');
  const existingSubjects = await fetchAll('subjects', { school_id: schoolId });
  const subjectMap = {}; // 'classId-code' -> id
  for (const s of existingSubjects) {
    subjectMap[`${s.class_id}-${s.code}`] = s.id;
  }

  const subjectsToInsert = [];
  for (const classId of allClassIds) {
    for (const sub of SUBJECT_LIST) {
      const key = `${classId}-${sub.code}`;
      if (!subjectMap[key]) {
        const id = generateCuid();
        subjectMap[key] = id;
        subjectsToInsert.push({
          id,
          school_id: schoolId,
          class_id: classId,
          name: sub.name,
          code: sub.code,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      }
    }
  }
  if (subjectsToInsert.length > 0) {
    await batchInsert('subjects', subjectsToInsert);
    console.log(`     + Created ${subjectsToInsert.length} subjects.`);
  } else {
    console.log(`     ✓ Subjects already fully assigned.`);
  }

  const allSubjectIds = Object.values(subjectMap);

  // C. Teachers & Teacher User Accounts
  console.log('  3. Verifying Faculty & Staff...');
  const existingTeachers = await fetchAll('teachers', { school_id: schoolId });
  const currentTeacherCount = existingTeachers.length;
  console.log(`     Current teachers: ${currentTeacherCount} / Target: ${config.targetTeachers}`);

  if (currentTeacherCount < config.targetTeachers) {
    const teachersNeeded = config.targetTeachers - currentTeacherCount;
    const newUsers = [];
    const newTeachers = [];

    for (let i = 1; i <= teachersNeeded; i++) {
      const num = currentTeacherCount + i;
      const empId = `${config.prefix}-TCH-${String(num).padStart(3, '0')}`;
      const isFemale = i % 2 === 0;
      const firstName = isFemale
        ? FIRST_NAMES_FEMALE[(num * 3) % FIRST_NAMES_FEMALE.length]
        : FIRST_NAMES_MALE[(num * 3) % FIRST_NAMES_MALE.length];
      const lastName = SURNAMES[(num * 5) % SURNAMES.length];
      const qualification = TEACHER_QUALIFICATIONS[num % TEACHER_QUALIFICATIONS.length];
      const email = `teacher.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${config.prefix.toLowerCase()}${num}@eduvanta.teacher`;

      const userId = generateCuid();
      const teacherId = generateCuid();

      newUsers.push({
        id: userId,
        email,
        name: `${firstName} ${lastName}`,
        password_hash: config.defaultPasswordHash,
        role: 'TEACHER',
        school_id: schoolId,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      newTeachers.push({
        id: teacherId,
        school_id: schoolId,
        user_id: userId,
        employee_id: empId,
        first_name: firstName,
        last_name: lastName,
        qualification,
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }

    await batchInsert('users', newUsers);
    await batchInsert('teachers', newTeachers);
    console.log(`     + Created ${newTeachers.length} new teachers and staff user accounts.`);
  }

  const allTeachers = await fetchAll('teachers', { school_id: schoolId });
  const firstTeacherId = allTeachers[0]?.id || generateCuid();
  const firstUserId = allTeachers[0]?.user_id || generateCuid();

  // D. Students
  console.log('  4. Verifying Student Enrolment...');
  const existingStudents = await fetchAll('students', { school_id: schoolId });
  const currentStudentCount = existingStudents.length;
  console.log(`     Current students: ${currentStudentCount} / Target: ${config.targetStudents}`);

  if (currentStudentCount < config.targetStudents) {
    const studentsNeeded = config.targetStudents - currentStudentCount;
    const newStudents = [];
    const newUsers = [];

    for (let i = 1; i <= studentsNeeded; i++) {
      const num = currentStudentCount + i;
      const admNo = `${config.prefix}-2026-${String(num).padStart(4, '0')}`;
      const isFemale = num % 2 === 0;
      const firstName = isFemale
        ? FIRST_NAMES_FEMALE[num % FIRST_NAMES_FEMALE.length]
        : FIRST_NAMES_MALE[num % FIRST_NAMES_MALE.length];
      const lastName = SURNAMES[(num * 7) % SURNAMES.length];
      const guardianPrefix = FIRST_NAMES_MALE[(num * 11) % FIRST_NAMES_MALE.length];
      const guardianName = `${guardianPrefix} ${lastName}`;
      const guardianPhone = `+91 98${String((num * 123456) % 100000000).padStart(8, '7')}`;
      const studentClassId = allClassIds[num % allClassIds.length];

      // DOB between 2009 and 2015
      const birthYear = 2009 + (num % 6);
      const birthMonth = String(1 + (num % 12)).padStart(2, '0');
      const birthDay = String(1 + (num % 28)).padStart(2, '0');
      const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;

      const studentId = generateCuid();
      const userId = generateCuid();
      const email = `student.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${config.prefix.toLowerCase()}${num}.${schoolId.slice(-4)}@eduvanta.student`;

      newUsers.push({
        id: userId,
        email,
        name: `${firstName} ${lastName}`,
        password_hash: config.defaultPasswordHash,
        role: 'STUDENT',
        school_id: schoolId,
        is_active: true,
        created_at: now,
        updated_at: now,
      });

      newStudents.push({
        id: studentId,
        school_id: schoolId,
        user_id: userId,
        admission_number: admNo,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender: isFemale ? 'FEMALE' : 'MALE',
        address: `At Post Village, Taluka Aurangabad/District, Maharashtra`,
        guardian_name: guardianName,
        guardian_phone: guardianPhone,
        class_id: studentClassId,
        enrollment_date: '2026-06-15T00:00:00.000Z',
        academic_year: '2026-27',
        is_active: true,
        created_at: now,
        updated_at: now,
      });
    }

    await batchInsert('users', newUsers);
    await batchInsert('students', newStudents);
    console.log(`     + Enrolled ${newStudents.length} authentic students and provisioned portal access.`);
  }

  // Ensure every student has a valid class_id
  console.log('     Verifying class assignments for all students...');
  const { data: unassignedStudents } = await supabase
    .from('students')
    .select('id')
    .eq('school_id', schoolId)
    .is('class_id', null);

  if (unassignedStudents && unassignedStudents.length > 0) {
    console.log(`     Assigning ${unassignedStudents.length} unassigned students to active sections...`);
    for (let i = 0; i < unassignedStudents.length; i++) {
      const assignedClassId = allClassIds[i % allClassIds.length];
      await supabase.from('students').update({ class_id: assignedClassId }).eq('id', unassignedStudents[i].id);
    }
  }

  // Reload fresh sample of students for relations
  const { data: studentSampleRaw } = await supabase
    .from('students')
    .select('id, class_id')
    .eq('school_id', schoolId)
    .not('class_id', 'is', null)
    .limit(300);
  const studentSample = studentSampleRaw || [];

  // E. 30 Days Attendance
  console.log('  5. Verifying Attendance Records...');
  const { count: attCount } = await supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((attCount || 0) < 500) {
    console.log(`     Generating ${config.attendanceDays} days of class attendance records...`);
    const attendanceRecords = [];
    const today = new Date();

    // Loop back N school days
    for (let dayOffset = 0; dayOffset < config.attendanceDays; dayOffset++) {
      const d = new Date(today);
      d.setDate(today.getDate() - dayOffset);
      if (d.getDay() === 0) continue; // Skip Sundays

      const dateStr = d.toISOString().split('T')[0];

      // Mark for each class with our student sample
      for (const st of studentSample.slice(0, 150)) {
        if (!st.class_id) continue;
        // 93% Present, 5% Absent, 2% Late
        const rand = (st.id.charCodeAt(2) + dayOffset * 7) % 100;
        let status = 'PRESENT';
        if (rand < 5) status = 'ABSENT';
        else if (rand < 8) status = 'LATE';

        attendanceRecords.push({
          id: generateCuid(),
          school_id: schoolId,
          class_id: st.class_id,
          student_id: st.id,
          date: dateStr,
          status,
          marked_by_teacher_id: firstTeacherId,
          created_at: now,
        });
      }
    }

    await batchInsert('attendance_records', attendanceRecords);
    console.log(`     + Generated ${attendanceRecords.length} daily attendance entries.`);
  } else {
    console.log(`     ✓ Attendance records already populated (${attCount} records).`);
  }

  // F. Academic Assessments & Records
  console.log('  6. Verifying Academic Performance & Assessments...');
  const { count: assessCount } = await supabase.from('assessments').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((assessCount || 0) < 5) {
    const assessmentsToInsert = [];
    const academicRecords = [];

    const examTypes = [
      { name: 'Unit Test 1', type: 'UNIT_TEST', max: 25 },
      { name: 'Half-Yearly Examination', type: 'HALF_YEARLY', max: 80 },
      { name: 'Annual Examination', type: 'ANNUAL', max: 100 },
    ];

    for (const exam of examTypes) {
      for (let sIdx = 0; sIdx < Math.min(SUBJECT_LIST.length, 3); sIdx++) {
        const sub = SUBJECT_LIST[sIdx];
        const classId = allClassIds[0];
        const subjectId = allSubjectIds[sIdx] || allSubjectIds[0];
        const assessId = generateCuid();

        assessmentsToInsert.push({
          id: assessId,
          school_id: schoolId,
          class_id: classId,
          subject_id: subjectId,
          name: `${exam.name} - ${sub.name}`,
          type: exam.type,
          max_marks: exam.max,
          conducted_date: '2026-09-20T00:00:00.000Z',
          academic_year: '2026-27',
          created_at: now,
          updated_at: now,
        });

        // Add records for 40 students
        for (const st of studentSample.slice(0, 40)) {
          const score = Math.floor(exam.max * 0.4 + ((st.id.charCodeAt(3) * 13) % Math.floor(exam.max * 0.58)));
          academicRecords.push({
            id: generateCuid(),
            school_id: schoolId,
            student_id: st.id,
            assessment_id: assessId,
            marks_obtained: score,
            remarks: score > exam.max * 0.75 ? 'Excellent performance' : score > exam.max * 0.5 ? 'Satisfactory' : 'Needs improvement',
            created_at: now,
            updated_at: now,
          });
        }
      }
    }

    await batchInsert('assessments', assessmentsToInsert);
    await batchInsert('academic_records', academicRecords);
    console.log(`     + Created ${assessmentsToInsert.length} assessments and ${academicRecords.length} marks records.`);
  } else {
    console.log(`     ✓ Academic assessments already exist.`);
  }

  // G. School Notices
  console.log('  7. Verifying School Notices & Circulars...');
  const { count: noticeCount } = await supabase.from('notices').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((noticeCount || 0) < config.noticesCount) {
    const NOTICES_TEMPLATES = [
      { title: 'Mid-Day Meal Scheme Menu Update & Nutrition Guidelines', content: 'In compliance with the Maharashtra School Education Department directives, the weekly fortified lunch menu has been updated with pulses, eggs, and banana supplements.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'Parent-Teacher Meeting (PTM) for Term 1 Evaluation', content: 'All parents and guardians are requested to attend the upcoming PTM this Saturday at 10:00 AM to review student academic progress, attendance records, and health check-up cards.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'Annual Sports Meet & Inter-House Athletics Schedule', content: 'Track and field events including 100m sprint, Kho-Kho, Kabaddi, and Relay will commence from next Friday. Students must register with the sports department.', audience: 'STUDENTS', status: 'PUBLISHED' },
      { title: 'Staff Council Meeting: Digital Curriculum & AI Tools', content: 'Faculty members are invited to attend the workshop on digital classrooms, automated attendance taking, and academic intervention tracking.', audience: 'TEACHERS', status: 'PUBLISHED' },
      { title: 'National Means-cum-Merit Scholarship (NMMS) Registration', content: 'Eligible Class 8 students must submit their scholarship application forms along with parent income certificates to the school office before the end of this month.', audience: 'STUDENTS', status: 'PUBLISHED' },
      { title: 'Diwali Vacation Dates & Holiday Homework Announcement', content: 'The school will remain closed for Diwali break from 28th October to 12th November. Comprehensive project worksheets have been uploaded in the Learning Resources section.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'Clean Campus Campaign (Swachhata Pakhwada)', content: 'Students and staff will participate in campus tree planting and water conservation awareness drives this Wednesday morning.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'State Science Fair Project Selection Guidelines', content: 'Students interested in entering working science models on renewable energy and rural irrigation must present abstracts to their science teachers.', audience: 'STUDENTS', status: 'PUBLISHED' },
      { title: 'Uniform Distribution & Textbook Verification', content: 'Government free textbook sets and school uniforms for classes 5 to 8 will be distributed in the assembly hall tomorrow.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'Quarterly Examination Time Table Released', content: 'The examination timetable for Classes 5 to 10 has been finalized. Morning session: 09:30 AM to 12:30 PM. Hall tickets are available in the student portal.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'Yoga and Wellness Morning Sessions Introduced', content: 'To promote student physical and mental health, daily 15-minute guided Suryanamaskar sessions will take place during morning assembly.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'English Communication & Reading Club Every Tuesday', content: 'Special communicative English listening and reading modules will be conducted for Class 6 and 7 students every Tuesday afternoon.', audience: 'STUDENTS', status: 'PUBLISHED' },
      { title: 'Emergency Fire Safety and Evacuation Drill', content: 'An unannounced fire drill will be conducted next week under the supervision of the local municipal fire department.', audience: 'ALL', status: 'PUBLISHED' },
      { title: 'Teacher Training on Continuous and Comprehensive Evaluation (CCE)', content: 'All teachers must complete the online CCE rubric assessment training modules by Friday.', audience: 'TEACHERS', status: 'PUBLISHED' },
      { title: 'Inter-School Folk Dance & Cultural Fest Entries Open', content: 'Auditions for Lavani, Lezim, and traditional folk dance presentations will be held in the auditorium this Thursday.', audience: 'STUDENTS', status: 'PUBLISHED' },
    ];

    const noticesToInsert = [];
    const needed = config.noticesCount - (noticeCount || 0);
    for (let i = 0; i < needed; i++) {
      const tmpl = NOTICES_TEMPLATES[i % NOTICES_TEMPLATES.length];
      const pubDate = new Date(Date.now() - (i * 86400000 * 2)).toISOString();
      noticesToInsert.push({
        id: generateCuid(),
        school_id: schoolId,
        title: `${tmpl.title} (${config.prefix}-${i + 1})`,
        content: tmpl.content,
        target_audience: tmpl.audience,
        status: tmpl.status,
        visibility: 'PUBLIC',
        published_at: pubDate,
        created_by_user_id: firstUserId,
        created_at: pubDate,
        updated_at: pubDate,
      });
    }

    await batchInsert('notices', noticesToInsert);
    console.log(`     + Created ${noticesToInsert.length} official notices.`);
  } else {
    console.log(`     ✓ Notices already populated (${noticeCount} notices).`);
  }

  // H. Learning Resources
  console.log('  8. Verifying Learning Resources & Study Materials...');
  const { count: resCount } = await supabase.from('learning_resources').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((resCount || 0) < config.resourcesCount) {
    const RESOURCE_TITLES = [
      'Comprehensive Mathematics Formula Handbook (Class 10)',
      'Science Chapter 1: Chemical Reactions & Equations - Study Notes',
      'Marathi Grammar: Vyakaran & Nibandh Lekhan Reference Guide',
      'English Prose Analysis: Short Stories and Vocabulary Builder',
      'Geography: Physical Features & River Systems of Maharashtra',
      'History: The Maratha Empire & Chhatrapati Shivaji Maharaj',
      'Physics: Light Reflection & Refraction Practice Worksheet',
      'Life Sciences: Cell Biology and Plant Reproduction Diagrams',
      'Algebra: Quadratic Equations Problem Set with Solutions',
      'Geometry: Circles & Triangles Theorems and Proofs Guide',
      'Environmental Studies: Conservation of Water and Native Forests',
      'Hindi Grammatical Forms and Letter Writing Templates',
      'NMMS Competitive Exam Sample Question Papers with Key',
      'General Knowledge & Current Affairs Digest 2026',
      'Computer Literacy: Introduction to Digital Spreadsheets & Typing',
    ];

    const needed = config.resourcesCount - (resCount || 0);
    const resourcesToInsert = [];
    for (let i = 0; i < needed; i++) {
      const title = RESOURCE_TITLES[i % RESOURCE_TITLES.length];
      const classId = allClassIds[i % allClassIds.length];
      const subjectId = allSubjectIds[i % allSubjectIds.length] || allSubjectIds[0];
      resourcesToInsert.push({
        id: generateCuid(),
        school_id: schoolId,
        class_id: classId,
        subject_id: subjectId,
        topic: 'Core Academic Curriculum',
        title: `${title} (Part ${i + 1})`,
        description: 'Comprehensive curriculum study material aligned with Maharashtra State Board standards.',
        file_url: `https://eduvanta.storage/resources/${config.prefix.toLowerCase()}-doc-${i + 1}.pdf`,
        file_type: 'PDF',
        file_size_bytes: 1024 * 1024 * (1 + (i % 8)),
        uploaded_by_teacher_id: firstTeacherId,
        uploaded_by_user_id: firstUserId,
        created_at: now,
      });
    }

    await batchInsert('learning_resources', resourcesToInsert);
    console.log(`     + Created ${resourcesToInsert.length} learning resources.`);
  } else {
    console.log(`     ✓ Learning resources already populated (${resCount} resources).`);
  }

  // I. Quizzes with Questions
  console.log('  9. Verifying Quizzes & Question Banks...');
  const { count: quizCount } = await supabase.from('quiz_definitions').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((quizCount || 0) < config.quizzesCount) {
    const QUIZ_TOPICS = [
      { title: 'Algebra Fundamentals & Linear Equations', topic: 'Algebra' },
      { title: 'Science: Laws of Motion & Gravitation', topic: 'Physics' },
      { title: 'Marathi Grammar & Synonyms Quiz', topic: 'Language' },
      { title: 'Cell Structure and Function Review', topic: 'Biology' },
      { title: 'Indian Constitution & Fundamental Rights', topic: 'Civics' },
      { title: 'Chemical Reactions and Catalysts', topic: 'Chemistry' },
      { title: 'World Geography: Oceans & Climates', topic: 'Geography' },
      { title: 'English Tenses and Active-Passive Voice', topic: 'Grammar' },
      { title: 'Triangles and Coordinate Geometry', topic: 'Geometry' },
      { title: 'Environmental Science & Ecosystems', topic: 'EVS' },
    ];

    const needed = config.quizzesCount - (quizCount || 0);
    const quizzesToInsert = [];
    const questionsToInsert = [];

    for (let i = 0; i < needed; i++) {
      const qz = QUIZ_TOPICS[i % QUIZ_TOPICS.length];
      const quizId = generateCuid();
      const classId = allClassIds[i % allClassIds.length];
      const subjectId = allSubjectIds[i % allSubjectIds.length] || allSubjectIds[0];

      quizzesToInsert.push({
        id: quizId,
        school_id: schoolId,
        class_id: classId,
        subject_id: subjectId,
        title: `${qz.title} #${i + 1}`,
        topic: qz.topic,
        created_by_teacher_id: firstTeacherId,
        is_published: true,
        created_at: now,
        updated_at: now,
      });

      // 4 questions per quiz
      for (let q = 1; q <= 4; q++) {
        questionsToInsert.push({
          id: generateCuid(),
          quiz_id: quizId,
          question_text: `Question ${q}: What is the core principle or rule applied in ${qz.topic} when analyzing scenario ${q}?`,
          option_a: `Standard Formula Rule Alpha`,
          option_b: `Constant Conservation Principle`,
          option_c: `Differential Inverse Method`,
          option_d: `None of the above`,
          correct_option: ['A', 'B', 'C', 'A'][q % 4],
          order: q,
        });
      }
    }

    await batchInsert('quiz_definitions', quizzesToInsert);
    await batchInsert('quiz_questions', questionsToInsert);
    console.log(`     + Created ${quizzesToInsert.length} quizzes with ${questionsToInsert.length} questions.`);
  } else {
    console.log(`     ✓ Quizzes already populated (${quizCount} quizzes).`);
  }

  // J. Gallery Items
  console.log('  10. Verifying School Gallery Photos...');
  const { count: galleryCount } = await supabase.from('gallery_items').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((galleryCount || 0) < config.galleryCount) {
    const GALLERY_CATEGORIES = ['SPORTS', 'EVENTS', 'ACTIVITIES', 'INFRASTRUCTURE', 'ACHIEVEMENTS', 'CULTURAL', 'EDUCATIONAL'];
    const GALLERY_TITLES = [
      'State-Level Kabaddi Championship Victory',
      'Annual Science Exhibition Model Demonstrations',
      'Campus Tree Plantation Drive & Herbal Garden',
      'Smart Classroom Digital Learning Session',
      'Republic Day Flag Hoisting & Parade',
      'Traditional Lezim Dance Performance at Gathering',
      'School Library & Reading Room Facility',
      'Mid-Day Meal Dining Hall in Operation',
      'Computer Laboratory Practical Class',
      'Inter-House Cricket Final Match',
      'Prize Distribution Ceremony & Best Student Award',
      'Teachers Day Celebration & Cultural Play',
    ];

    const needed = config.galleryCount - (galleryCount || 0);
    const galleryToInsert = [];
    for (let i = 0; i < needed; i++) {
      const title = GALLERY_TITLES[i % GALLERY_TITLES.length];
      const cat = GALLERY_CATEGORIES[i % GALLERY_CATEGORIES.length];
      galleryToInsert.push({
        id: generateCuid(),
        school_id: schoolId,
        title: `${title} (${i + 1})`,
        description: `Photographic documentation of campus activities and student achievements at ${school.name}.`,
        category: cat,
        file_url: `https://images.unsplash.com/photo-${1577896851231 + (i * 1234)}?auto=format&fit=crop&w=800&q=80`,
        is_public: true,
        uploaded_by_user_id: firstUserId,
        created_at: now,
      });
    }

    await batchInsert('gallery_items', galleryToInsert);
    console.log(`     + Created ${galleryToInsert.length} gallery images.`);
  } else {
    console.log(`     ✓ Gallery already populated (${galleryCount} items).`);
  }

  // K. Transfer Certificates (TC)
  console.log('  11. Verifying Transfer Certificates (TC)...');
  const { count: tcCount } = await supabase.from('transfer_certificates').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((tcCount || 0) < config.tcCount) {
    const needed = config.tcCount - (tcCount || 0);
    const tcsToInsert = [];
    for (let i = 0; i < needed; i++) {
      const st = studentSample[i % studentSample.length];
      const isIssued = i < 5; // 5 issued, rest requested/approved
      const tcNumber = `${config.prefix}-TC-${schoolId.slice(-4)}-2026-${String(i + 1).padStart(3, '0')}`;
      tcsToInsert.push({
        id: generateCuid(),
        school_id: schoolId,
        student_id: st.id,
        tc_number: tcNumber,
        reason: i % 2 === 0 ? 'Parent transfer to other district' : 'Admission to Higher Secondary School',
        requested_date: '2026-09-01T00:00:00.000Z',
        approved_date: isIssued ? '2026-09-05T00:00:00.000Z' : null,
        issued_date: isIssued ? '2026-09-08T00:00:00.000Z' : null,
        status: isIssued ? 'ISSUED' : (i % 2 === 0 ? 'APPROVED' : 'REQUESTED'),
        approved_by_user_id: isIssued ? firstUserId : null,
        file_url: isIssued ? `https://eduvanta.storage/tc/${tcNumber}.docx` : null,
        created_at: now,
        updated_at: now,
      });
    }

    await batchInsert('transfer_certificates', tcsToInsert);
    console.log(`     + Created ${tcsToInsert.length} TC records (including 5 verified issued certificates).`);
  } else {
    console.log(`     ✓ TC records already populated (${tcCount} records).`);
  }

  // L. Early Warning Records
  console.log('  12. Verifying Early Warning Flags...');
  const { count: ewCount } = await supabase.from('early_warning_flags').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((ewCount || 0) < config.earlyWarningCount) {
    const needed = config.earlyWarningCount - (ewCount || 0);
    const flagsToInsert = [];
    for (let i = 0; i < needed; i++) {
      const st = studentSample[i % studentSample.length];
      const isAttendance = i % 2 === 0;
      flagsToInsert.push({
        id: generateCuid(),
        school_id: schoolId,
        student_id: st.id,
        flag_type: isAttendance ? 'LOW_ATTENDANCE' : 'LOW_ACADEMIC_PERFORMANCE',
        details: isAttendance ? {
          actual: 68.4,
          threshold: 75.0,
          reason: 'Student attendance has dropped to 68.4% over the last 30 school days.',
          severity: 'HIGH',
          recommendedAction: 'Parent contact required; schedule counseling review.',
        } : {
          actual: 38.0,
          threshold: 40.0,
          reason: 'Continuous assessment score in Mathematics is below the minimum passing threshold.',
          severity: 'MEDIUM',
          recommendedAction: 'Enroll in remedial after-school mathematics tutorial.',
        },
        is_resolved: false,
        created_at: now,
      });
    }

    await batchInsert('early_warning_flags', flagsToInsert);
    console.log(`     + Created ${flagsToInsert.length} early warning flags.`);
  } else {
    console.log(`     ✓ Early warning flags already populated (${ewCount} flags).`);
  }

  // M. Facilities, Achievements, Events & Profile Branding
  console.log('  13. Updating School Facilities & Profile Metadata...');
  await supabase.from('schools').update({
    tagline: 'Excellence in Vernacular and Digital Education',
    description: `${school.name} is a premier government ZP institution fostering academic distinction, digital literacy, and holistic sports development.`,
    is_active: true,
    is_public_enabled: true,
    logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=1E3A8A&color=ffffff&bold=true&size=128`,
    updated_at: now,
  }).eq('id', schoolId);

  // Facilities
  const { count: facCount } = await supabase.from('school_facilities').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((facCount || 0) === 0) {
    await supabase.from('school_facilities').insert([
      { id: generateCuid(), school_id: schoolId, name: 'Smart Computer Laboratory', description: '30 networked desktop computers with broadband internet access.', icon: 'Laptop' },
      { id: generateCuid(), school_id: schoolId, name: 'Science Exploration Center', description: 'Physics, Chemistry and Biology experimental apparatus and models.', icon: 'FlaskConical' },
      { id: generateCuid(), school_id: schoolId, name: 'Digital Central Library', description: 'Over 4,500 Marathi, English and Hindi books and journals.', icon: 'BookOpen' },
      { id: generateCuid(), school_id: schoolId, name: 'Mid-Day Meal Dining Hall', description: 'Hygienic community kitchen serving fortified nutritious meals daily.', icon: 'Utensils' },
      { id: generateCuid(), school_id: schoolId, name: 'Sports Field & Athletic Track', description: 'Dedicated grounds for Kabaddi, Kho-Kho, Volleyball and Athletics.', icon: 'Trophy' },
    ]);
  }

  // Achievements
  const { count: achCount } = await supabase.from('school_achievements').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((achCount || 0) === 0) {
    await supabase.from('school_achievements').insert([
      { id: generateCuid(), school_id: schoolId, title: '100% SSC Board Examination Pass Rate', description: 'All enrolled students successfully graduated with first-class honors.', year: 2025 },
      { id: generateCuid(), school_id: schoolId, title: 'District Level Kabaddi Tournament Winners', description: 'Under-16 boys team secured the divisional championship cup.', year: 2025 },
      { id: generateCuid(), school_id: schoolId, title: 'State Science Fair 1st Prize Innovation Award', description: 'Awarded for rural solar drip irrigation automation project.', year: 2026 },
    ]);
  }

  // Events
  const { count: evCount } = await supabase.from('school_events').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
  if ((evCount || 0) === 0) {
    await supabase.from('school_events').insert([
      { id: generateCuid(), school_id: schoolId, title: 'Annual Sports & Athletic Championship', description: 'Inter-house competitions in athletics, gymnastics and team sports.', event_date: '2026-11-20T09:00:00.000Z', is_public: true, created_at: now, updated_at: now },
      { id: generateCuid(), school_id: schoolId, title: 'Science & Robotics Exhibition Day', description: 'Showcase of working scientific models and technological projects by students.', event_date: '2026-12-05T10:00:00.000Z', is_public: true, created_at: now, updated_at: now },
      { id: generateCuid(), school_id: schoolId, title: 'Annual Cultural Gathering (Snehasammelan)', description: 'Traditional Marathi music, folk dance, drama and cultural performances.', event_date: '2026-12-22T17:00:00.000Z', is_public: true, created_at: now, updated_at: now },
    ]);
  }

  console.log(`  ✓ Completed all dataset verifications for ${school.name}.\n`);
}

/**
 * Utility: Fetch all records matching filter
 */
async function fetchAll(table, filter = {}, limit = 5000) {
  let query = supabase.from(table).select('*').limit(limit);
  for (const [k, v] of Object.entries(filter)) {
    query = query.eq(k, v);
  }
  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching ${table}:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Utility: Batch insert records safely in chunks of 50
 */
async function batchInsert(table, records, chunkSize = 50) {
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      console.error(`Error batch inserting into ${table} (chunk ${i}-${i + chunk.length}):`, error.message);
      throw error;
    }
  }
}

runMasterSeed().catch(err => {
  console.error('Fatal seed failure:', err);
  process.exit(1);
});
