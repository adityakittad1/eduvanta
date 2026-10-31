/**
 * Seed 200 Random Students for ELLORA HIGHSCHOOL
 *
 * Distributes 200 students across Classes 5 to 10 (Divisions A & B)
 * Generates authentic Maharashtrian student identities, admission numbers,
 * guardians, birth dates, and student portal credentials.
 */

globalThis.WebSocket = require('ws');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function generateCuid() {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

const MALE_FIRST_NAMES = [
  'Aarav', 'Atharva', 'Omkar', 'Vedant', 'Pranav', 'Sarthak', 'Adwait', 'Rohit',
  'Rohan', 'Tejas', 'Mayur', 'Sagar', 'Yash', 'Nikhil', 'Varun', 'Kunal',
  'Akshay', 'Harsh', 'Gaurav', 'Sandeep', 'Sumit', 'Aditya', 'Abhishek', 'Suraj',
  'Kiran', 'Prathamesh', 'Chetan', 'Sanket', 'Sachin', 'Tushar', 'Ajinkya', 'Vaibhav',
  'Siddhesh', 'Ganesh', 'Mahesh', 'Vishal', 'Aniket', 'Amol', 'Dipak', 'Pravin'
];

const FEMALE_FIRST_NAMES = [
  'Sai', 'Ananya', 'Gauri', 'Shruti', 'Tanvi', 'Rutuja', 'Isha', 'Prajakta',
  'Sneha', 'Pooja', 'Swati', 'Pallavi', 'Shweta', 'Priyanka', 'Neha', 'Riya',
  'Mansi', 'Divya', 'Vaishnavi', 'Ashwini', 'Sonali', 'Komal', 'Prachi', 'Aishwarya',
  'Nikita', 'Madhuri', 'Anjali', 'Kavita', 'Manasi', 'Radha', 'Rupali', 'Sayali',
  'Sakshi', 'Bhakti', 'Siddhi', 'Shreya', 'Pranjal', 'Tejaswi', 'Namrata', 'Mayuri'
];

const SURNAMES = [
  'Deshmukh', 'Patil', 'Jadhav', 'Kulkarni', 'Shinde', 'Pawar', 'More', 'Joshi',
  'Chavan', 'Gaikwad', 'Kadam', 'Bhosale', 'Wagh', 'Deshpande', 'Mane', 'Salunkhe',
  'Thorat', 'Jagtap', 'Sawant', 'Tambe', 'Mohite', 'Ghorpade', 'Nalawade', 'Khot',
  'Gharge', 'Ingale', 'Shingte', 'Kute', 'Shirke', 'Kale', 'Khade', 'Gade',
  'Suryavanshi', 'Choudhary', 'Raut', 'Mhaske', 'Gholap', 'Magar', 'Dumbre', 'Borade'
];

const GUARDIAN_PREFIXES = ['Suresh', 'Balasaheb', 'Eknath', 'Ganesh', 'Santosh', 'Kailash', 'Ashok', 'Dattatray', 'Pramod', 'Vitthal', 'Maruti', 'Pandurang', 'Bhausaheb', 'Rajesh', 'Subhash', 'Sudhir', 'Dipak', 'Vijay', 'Anil', 'Ramesh'];

async function main() {
  console.log('========================================================');
  console.log('🚀 SEEDING 200 RANDOM STUDENTS IN ELLORA HIGHSCHOOL');
  console.log('========================================================\n');

  // 1. Locate Ellora Highschool
  const { data: school, error: schoolErr } = await supabase
    .from('schools')
    .select('id, name, slug')
    .ilike('name', '%ellora%')
    .single();

  if (schoolErr || !school) {
    console.error('❌ Could not find Ellora Highschool in database:', schoolErr);
    process.exit(1);
  }

  const schoolId = school.id;
  console.log(`📍 Found Target School: ${school.name} (ID: ${schoolId}, Slug: ${school.slug})\n`);

  // 2. Ensure Classes 5 to 10 with Divisions A & B exist for Ellora Highschool
  const grades = ['5', '6', '7', '8', '9', '10'];
  const divisions = ['A', 'B'];
  const classMap = {}; // key: '5-A' => classId

  console.log('📦 Setting up standard secondary classes (Class 5 to 10, Div A & B)...');
  for (const g of grades) {
    for (const div of divisions) {
      const className = `Class ${g}`;
      const classKey = `${g}-${div}`;

      const { data: existingClass } = await supabase
        .from('classes')
        .select('id')
        .eq('school_id', schoolId)
        .eq('name', className)
        .eq('division', div)
        .eq('academic_year', '2026-2027')
        .maybeSingle();

      if (existingClass) {
        classMap[classKey] = existingClass.id;
      } else {
        const classId = generateCuid();
        const now = new Date().toISOString();
        const { error: classErr } = await supabase.from('classes').insert({
          id: classId,
          school_id: schoolId,
          name: className,
          division: div,
          academic_year: '2026-2027',
          is_active: true,
          created_at: now,
          updated_at: now,
        });

        if (classErr) {
          console.error(`Failed to create class ${className} ${div}:`, classErr);
          throw classErr;
        }
        classMap[classKey] = classId;
      }
    }
  }
  console.log(`✅ 12 Class Sections verified and mapped.\n`);

  // 3. Pre-generate shared student password hash for efficiency
  const defaultPassword = 'Student@123';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 4. Check existing students to avoid admission number collisions
  const { data: existingStudents } = await supabase
    .from('students')
    .select('admission_number')
    .eq('school_id', schoolId);

  const existingAdmissions = new Set((existingStudents || []).map(s => s.admission_number));
  console.log(`ℹ️ Existing students in school: ${existingAdmissions.size}`);

  const targetCount = 200;
  let createdCount = 0;
  const classKeys = Object.keys(classMap); // 12 class keys

  console.log(`\n⏳ Generating and inserting ${targetCount} students...`);

  // Generate 200 student records
  const usersToInsert = [];
  const studentsToInsert = [];

  for (let i = 1; i <= targetCount; i++) {
    const admissionNumber = `ELR-2026-${String(i).padStart(3, '0')}`;
    if (existingAdmissions.has(admissionNumber)) {
      continue;
    }

    const isMale = i % 2 !== 0;
    const firstName = isMale
      ? MALE_FIRST_NAMES[(i * 7 + 3) % MALE_FIRST_NAMES.length]
      : FEMALE_FIRST_NAMES[(i * 11 + 5) % FEMALE_FIRST_NAMES.length];
    const lastName = SURNAMES[(i * 13 + 7) % SURNAMES.length];
    const guardianPrefix = GUARDIAN_PREFIXES[(i * 17) % GUARDIAN_PREFIXES.length];

    // Assign class rotationally across the 12 sections
    const assignedClassKey = classKeys[(i - 1) % classKeys.length];
    const classId = classMap[assignedClassKey];
    const gradeNum = parseInt(assignedClassKey.split('-')[0], 10);

    // Calculate birth year based on grade (e.g. Grade 5 -> ~11 yrs -> 2015)
    const birthYear = 2026 - (gradeNum + 6);
    const birthMonth = String((i % 12) + 1).padStart(2, '0');
    const birthDay = String((i % 27) + 1).padStart(2, '0');
    const dob = `${birthYear}-${birthMonth}-${birthDay}T00:00:00.000Z`;

    const userId = generateCuid();
    const studentId = generateCuid();
    const now = new Date().toISOString();

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.elr${String(i).padStart(3, '0')}@eduvanta.student`;
    const phone = `+91 98${String(22000000 + i).padStart(8, '0')}`;
    const address = `Khuldabad-Ellora Road, Chhatrapati Sambhajinagar, Maharashtra 431102`;

    usersToInsert.push({
      id: userId,
      email,
      name: `${firstName} ${lastName}`,
      password_hash: passwordHash,
      role: 'STUDENT',
      school_id: schoolId,
      is_active: true,
      created_at: now,
      updated_at: now,
    });

    studentsToInsert.push({
      id: studentId,
      school_id: schoolId,
      user_id: userId,
      admission_number: admissionNumber,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      gender: isMale ? 'MALE' : 'FEMALE',
      address,
      guardian_name: `${guardianPrefix} ${lastName}`,
      guardian_phone: phone,
      academic_year: '2026-2027',
      class_id: classId,
      is_active: true,
      enrollment_date: '2026-06-15T00:00:00.000Z',
      created_at: now,
      updated_at: now,
    });
  }

  // Insert in batches of 50 to respect payload limits
  const BATCH_SIZE = 50;

  for (let b = 0; b < usersToInsert.length; b += BATCH_SIZE) {
    const userBatch = usersToInsert.slice(b, b + BATCH_SIZE);
    const studentBatch = studentsToInsert.slice(b, b + BATCH_SIZE);

    const { error: uErr } = await supabase.from('users').insert(userBatch);
    if (uErr) {
      console.error(`Error inserting user batch ${b / BATCH_SIZE + 1}:`, uErr.message);
      throw uErr;
    }

    const { error: sErr } = await supabase.from('students').insert(studentBatch);
    if (sErr) {
      console.error(`Error inserting student batch ${b / BATCH_SIZE + 1}:`, sErr.message);
      throw sErr;
    }

    createdCount += studentBatch.length;
    console.log(`   ✨ Inserted batch ${b / BATCH_SIZE + 1} (${createdCount}/${usersToInsert.length} students)...`);
  }

  // Final verification
  const { count: finalStudentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  const { count: finalClassCount } = await supabase
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  console.log('\n========================================================');
  console.log(`🎉 SUCCESS: 200 Students added to ELLORA HIGHSCHOOL!`);
  console.log(`📊 Total students now in Ellora: ${finalStudentCount}`);
  console.log(`🏫 Total classes in Ellora: ${finalClassCount}`);
  console.log(`🔐 Default password for all created students: ${defaultPassword}`);
  console.log('========================================================\n');
}

main().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
