/**
 * Idempotent Maharashtra Sample Data Seed Script for EduVanta
 *
 * Populates 5 Maharashtra Schools:
 *  1. Zilla Parishad Prathamik Shala, Gangapur (gptps-gangapur)
 *  2. Shivaji Maharaj Vidyalaya, Pune (shivaji-maharaj-pune)
 *  3. Savitribai Phule Madhyamik Vidyalaya, Nashik (savitribai-phule-nashik)
 *  4. Sant Tukaram Vidyalaya, Ahmednagar (sant-tukaram-ahilyanagar)
 *  5. Rajmata Jijau Prathamik Shala, Kolhapur (rajmata-jijau-kolhapur)
 *
 * Provisions for each school:
 *  - Principal user account (pwd: Principal@123)
 *  - 3 Teacher accounts (pwd: Teacher@123)
 *  - 6 Classes (5 to 10) with divisions
 *  - 13-15 Maharashtrian Students with unique admission numbers and Student accounts (pwd: Student@123)
 *
 * Safety & Idempotency:
 *  - Checks if school/user/student already exists before inserting
 *  - Never duplicates records or overwrites existing production data
 *  - Supports --dry-run flag for safe validation
 */

globalThis.WebSocket = require('ws');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dolnmvzkbriadeahqwid.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_XWU8zEsvgbvPCLFNa64TRQ_6Mqhzlog';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function generateCuid() {
  return 'c' + crypto.randomBytes(12).toString('hex');
}

const isDryRun = process.argv.includes('--dry-run');

const SAMPLE_SCHOOLS = [
  {
    name: 'Zilla Parishad Prathamik Shala, Gangapur',
    slug: 'gptps-gangapur',
    location: 'Gangapur, Chhatrapati Sambhajinagar, Maharashtra',
    address: 'Near Old Bus Stand, Gangapur, Chhatrapati Sambhajinagar, Maharashtra 431109',
    contactPhone: '+91 2433 221100',
    contactEmail: 'gangapur.zp@eduvanta.org',
    principalName: 'Mr. Suresh Deshmukh (M.A., B.Ed.)',
    principalEmail: 'principal.gangapur@eduvanta.local',
    principalDisplayName: 'Suresh Deshmukh',
    tagline: 'Quality Vernacular Education for Rural Youth',
    description: 'Government ZP school committed to holistic rural education, foundational literacy, and digital empowerment in Chhatrapati Sambhajinagar district.',
    establishedYear: 1982,
    admissionPrefix: 'GP-2026',
    teachers: [
      { firstName: 'Vinod', lastName: 'Shinde', qualification: 'M.Sc. Mathematics, B.Ed.', employeeId: 'GP-TCH-01' },
      { firstName: 'Archana', lastName: 'Gaikwad', qualification: 'M.A. Marathi, B.Ed.', employeeId: 'GP-TCH-02' },
      { firstName: 'Nilesh', lastName: 'Kulkarni', qualification: 'B.Sc. Science, D.Ed.', employeeId: 'GP-TCH-03' },
    ],
    students: [
      { firstName: 'Aarav', lastName: 'Deshmukh', gender: 'MALE', dob: '2014-04-12', guardian: 'Suresh Deshmukh', phone: '+91 98220 11001', classGrade: '5', div: 'A' },
      { firstName: 'Sai', lastName: 'Patil', gender: 'FEMALE', dob: '2014-08-23', guardian: 'Balasaheb Patil', phone: '+91 98220 11002', classGrade: '5', div: 'A' },
      { firstName: 'Atharva', lastName: 'Jadhav', gender: 'MALE', dob: '2013-02-15', guardian: 'Eknath Jadhav', phone: '+91 98220 11003', classGrade: '6', div: 'A' },
      { firstName: 'Ananya', lastName: 'Kulkarni', gender: 'FEMALE', dob: '2013-06-30', guardian: 'Ganesh Kulkarni', phone: '+91 98220 11004', classGrade: '6', div: 'B' },
      { firstName: 'Omkar', lastName: 'Shinde', gender: 'MALE', dob: '2012-09-18', guardian: 'Santosh Shinde', phone: '+91 98220 11005', classGrade: '7', div: 'A' },
      { firstName: 'Gauri', lastName: 'Pawar', gender: 'FEMALE', dob: '2012-11-05', guardian: 'Kailash Pawar', phone: '+91 98220 11006', classGrade: '7', div: 'B' },
      { firstName: 'Vedant', lastName: 'More', gender: 'MALE', dob: '2011-01-22', guardian: 'Ashok More', phone: '+91 98220 11007', classGrade: '8', div: 'A' },
      { firstName: 'Shruti', lastName: 'Joshi', gender: 'FEMALE', dob: '2011-05-14', guardian: 'Dattatray Joshi', phone: '+91 98220 11008', classGrade: '8', div: 'A' },
      { firstName: 'Tanvi', lastName: 'Chavan', gender: 'FEMALE', dob: '2010-07-19', guardian: 'Pramod Chavan', phone: '+91 98220 11009', classGrade: '9', div: 'A' },
      { firstName: 'Pranav', lastName: 'Gaikwad', gender: 'MALE', dob: '2010-10-03', guardian: 'Vitthal Gaikwad', phone: '+91 98220 11010', classGrade: '9', div: 'B' },
      { firstName: 'Rutuja', lastName: 'Kadam', gender: 'FEMALE', dob: '2009-03-25', guardian: 'Maruti Kadam', phone: '+91 98220 11011', classGrade: '10', div: 'A' },
      { firstName: 'Sarthak', lastName: 'Bhosale', gender: 'MALE', dob: '2009-08-11', guardian: 'Pandurang Bhosale', phone: '+91 98220 11012', classGrade: '10', div: 'A' },
      { firstName: 'Isha', lastName: 'Wagh', gender: 'FEMALE', dob: '2014-02-14', guardian: 'Bhausaheb Wagh', phone: '+91 98220 11013', classGrade: '5', div: 'B' },
    ],
  },
  {
    name: 'Shivaji Maharaj Vidyalaya',
    slug: 'shivaji-maharaj-pune',
    location: 'Pune, Maharashtra',
    address: 'Shivaji Nagar, Near Deccan Gymkhana, Pune, Maharashtra 411005',
    contactPhone: '+91 20 2567 4321',
    contactEmail: 'pune.smv@eduvanta.org',
    principalName: 'Dr. Anandrao More (Ph.D., M.Ed.)',
    principalEmail: 'principal.pune@eduvanta.local',
    principalDisplayName: 'Anandrao More',
    tagline: 'Tradition of Academic Excellence & Character Building',
    description: 'Renowned high school in Pune delivering STEM education, competitive exam training, and sports excellence.',
    establishedYear: 1975,
    admissionPrefix: 'SMP-2026',
    teachers: [
      { firstName: 'Deepak', lastName: 'Bhosale', qualification: 'M.Sc. Physics, B.Ed.', employeeId: 'SM-TCH-01' },
      { firstName: 'Megha', lastName: 'Deshpande', qualification: 'M.A. English, B.Ed.', employeeId: 'SM-TCH-02' },
      { firstName: 'Sunil', lastName: 'Wagh', qualification: 'B.P.Ed., Sports Coach', employeeId: 'SM-TCH-03' },
    ],
    students: [
      { firstName: 'Adwait', lastName: 'Deshpande', gender: 'MALE', dob: '2014-05-10', guardian: 'Rajesh Deshpande', phone: '+91 98220 22001', classGrade: '5', div: 'A' },
      { firstName: 'Prajakta', lastName: 'Mane', gender: 'FEMALE', dob: '2014-09-17', guardian: 'Subhash Mane', phone: '+91 98220 22002', classGrade: '5', div: 'A' },
      { firstName: 'Omkar', lastName: 'Shinde', gender: 'MALE', dob: '2013-03-21', guardian: 'Sudhir Shinde', phone: '+91 98220 22003', classGrade: '6', div: 'A' },
      { firstName: 'Gauri', lastName: 'Pawar', gender: 'FEMALE', dob: '2013-07-14', guardian: 'Ramesh Pawar', phone: '+91 98220 22004', classGrade: '6', div: 'B' },
      { firstName: 'Vedant', lastName: 'More', gender: 'MALE', dob: '2012-10-09', guardian: 'Dipak More', phone: '+91 98220 22005', classGrade: '7', div: 'A' },
      { firstName: 'Shruti', lastName: 'Joshi', gender: 'FEMALE', dob: '2012-12-01', guardian: 'Prashant Joshi', phone: '+91 98220 22006', classGrade: '7', div: 'A' },
      { firstName: 'Tanvi', lastName: 'Chavan', gender: 'FEMALE', dob: '2011-04-18', guardian: 'Vikas Chavan', phone: '+91 98220 22007', classGrade: '8', div: 'A' },
      { firstName: 'Pranav', lastName: 'Gaikwad', gender: 'MALE', dob: '2011-08-25', guardian: 'Sunil Gaikwad', phone: '+91 98220 22008', classGrade: '8', div: 'B' },
      { firstName: 'Aarav', lastName: 'Deshmukh', gender: 'MALE', dob: '2010-01-30', guardian: 'Nitin Deshmukh', phone: '+91 98220 22009', classGrade: '9', div: 'A' },
      { firstName: 'Sai', lastName: 'Patil', gender: 'FEMALE', dob: '2010-06-12', guardian: 'Abhay Patil', phone: '+91 98220 22010', classGrade: '9', div: 'A' },
      { firstName: 'Atharva', lastName: 'Jadhav', gender: 'MALE', dob: '2009-02-18', guardian: 'Milind Jadhav', phone: '+91 98220 22011', classGrade: '10', div: 'A' },
      { firstName: 'Ananya', lastName: 'Kulkarni', gender: 'FEMALE', dob: '2009-11-20', guardian: 'Vivek Kulkarni', phone: '+91 98220 22012', classGrade: '10', div: 'A' },
      { firstName: 'Rutuja', lastName: 'Kadam', gender: 'FEMALE', dob: '2014-01-08', guardian: 'Sanjay Kadam', phone: '+91 98220 22013', classGrade: '5', div: 'B' },
    ],
  },
  {
    name: 'Savitribai Phule Madhyamik Vidyalaya',
    slug: 'savitribai-phule-nashik',
    location: 'Nashik, Maharashtra',
    address: 'Panchavati, Near Gangapur Road, Nashik, Maharashtra 422003',
    contactPhone: '+91 253 234 5678',
    contactEmail: 'nashik.spmv@eduvanta.org',
    principalName: 'Mrs. Sunita Jadhav (M.Sc., M.Ed.)',
    principalEmail: 'principal.nashik@eduvanta.local',
    principalDisplayName: 'Sunita Jadhav',
    tagline: 'Empowering Girls and Underprivileged Children with Quality Education',
    description: 'Leading secondary school inspired by Savitribai Phule with state-of-the-art computer labs and holistic extracurriculars.',
    establishedYear: 1990,
    admissionPrefix: 'SPN-2026',
    teachers: [
      { firstName: 'Ravindra', lastName: 'Chavan', qualification: 'M.A. History, B.Ed.', employeeId: 'SP-TCH-01' },
      { firstName: 'Kavita', lastName: 'More', qualification: 'M.Sc. Chemistry, B.Ed.', employeeId: 'SP-TCH-02' },
      { firstName: 'Sachin', lastName: 'Patil', qualification: 'B.A., D.Ed.', employeeId: 'SP-TCH-03' },
    ],
    students: [
      { firstName: 'Sai', lastName: 'Patil', gender: 'FEMALE', dob: '2014-03-15', guardian: 'Suresh Patil', phone: '+91 98220 33001', classGrade: '5', div: 'A' },
      { firstName: 'Atharva', lastName: 'Jadhav', gender: 'MALE', dob: '2014-07-22', guardian: 'Ravindra Jadhav', phone: '+91 98220 33002', classGrade: '5', div: 'A' },
      { firstName: 'Ananya', lastName: 'Kulkarni', gender: 'FEMALE', dob: '2013-05-19', guardian: 'Anand Kulkarni', phone: '+91 98220 33003', classGrade: '6', div: 'A' },
      { firstName: 'Omkar', lastName: 'Shinde', gender: 'MALE', dob: '2013-10-11', guardian: 'Bapu Shinde', phone: '+91 98220 33004', classGrade: '6', div: 'B' },
      { firstName: 'Gauri', lastName: 'Pawar', gender: 'FEMALE', dob: '2012-04-03', guardian: 'Bhagwan Pawar', phone: '+91 98220 33005', classGrade: '7', div: 'A' },
      { firstName: 'Vedant', lastName: 'More', gender: 'MALE', dob: '2012-08-27', guardian: 'Tukaram More', phone: '+91 98220 33006', classGrade: '7', div: 'A' },
      { firstName: 'Shruti', lastName: 'Joshi', gender: 'FEMALE', dob: '2011-02-14', guardian: 'Jayant Joshi', phone: '+91 98220 33007', classGrade: '8', div: 'A' },
      { firstName: 'Tanvi', lastName: 'Chavan', gender: 'FEMALE', dob: '2011-09-09', guardian: 'Shivaji Chavan', phone: '+91 98220 33008', classGrade: '8', div: 'B' },
      { firstName: 'Pranav', lastName: 'Gaikwad', gender: 'MALE', dob: '2010-03-31', guardian: 'Kishor Gaikwad', phone: '+91 98220 33009', classGrade: '9', div: 'A' },
      { firstName: 'Rutuja', lastName: 'Kadam', gender: 'FEMALE', dob: '2010-12-16', guardian: 'Shrikant Kadam', phone: '+91 98220 33010', classGrade: '9', div: 'A' },
      { firstName: 'Sarthak', lastName: 'Bhosale', gender: 'MALE', dob: '2009-04-05', guardian: 'Narayan Bhosale', phone: '+91 98220 33011', classGrade: '10', div: 'A' },
      { firstName: 'Isha', lastName: 'Wagh', gender: 'FEMALE', dob: '2009-09-28', guardian: 'Prabhakar Wagh', phone: '+91 98220 33012', classGrade: '10', div: 'A' },
      { firstName: 'Aarav', lastName: 'Deshmukh', gender: 'MALE', dob: '2014-11-19', guardian: 'Vijay Deshmukh', phone: '+91 98220 33013', classGrade: '5', div: 'B' },
    ],
  },
  {
    name: 'Sant Tukaram Vidyalaya',
    slug: 'sant-tukaram-ahilyanagar',
    location: 'Ahmednagar (Ahilyanagar), Maharashtra',
    address: 'Station Road, Near Savedi, Ahmednagar, Maharashtra 414003',
    contactPhone: '+91 241 245 6789',
    contactEmail: 'ahilyanagar.stv@eduvanta.org',
    principalName: 'Mr. Dnyaneshwar Kadam (M.A., B.Ed.)',
    principalEmail: 'principal.ahilyanagar@eduvanta.local',
    principalDisplayName: 'Dnyaneshwar Kadam',
    tagline: 'Value-Based Learning & Academic Discipline',
    description: 'Prominent educational institution fostering cultural values, scientific curiosity, and holistic development.',
    establishedYear: 1988,
    admissionPrefix: 'STA-2026',
    teachers: [
      { firstName: 'Shubhangi', lastName: 'Jadhav', qualification: 'M.A. English, B.Ed.', employeeId: 'ST-TCH-01' },
      { firstName: 'Mahesh', lastName: 'Deshmukh', qualification: 'M.Sc. Mathematics, B.Ed.', employeeId: 'ST-TCH-02' },
      { firstName: 'Pooja', lastName: 'Shinde', qualification: 'B.Sc. Biology, D.Ed.', employeeId: 'ST-TCH-03' },
    ],
    students: [
      { firstName: 'Atharva', lastName: 'Jadhav', gender: 'MALE', dob: '2014-06-11', guardian: 'Arun Jadhav', phone: '+91 98220 44001', classGrade: '5', div: 'A' },
      { firstName: 'Ananya', lastName: 'Kulkarni', gender: 'FEMALE', dob: '2014-10-04', guardian: 'Govind Kulkarni', phone: '+91 98220 44002', classGrade: '5', div: 'A' },
      { firstName: 'Omkar', lastName: 'Shinde', gender: 'MALE', dob: '2013-01-29', guardian: 'Tanaji Shinde', phone: '+91 98220 44003', classGrade: '6', div: 'A' },
      { firstName: 'Gauri', lastName: 'Pawar', gender: 'FEMALE', dob: '2013-08-16', guardian: 'Sambhaji Pawar', phone: '+91 98220 44004', classGrade: '6', div: 'B' },
      { firstName: 'Vedant', lastName: 'More', gender: 'MALE', dob: '2012-03-23', guardian: 'Kashinath More', phone: '+91 98220 44005', classGrade: '7', div: 'A' },
      { firstName: 'Shruti', lastName: 'Joshi', gender: 'FEMALE', dob: '2012-07-08', guardian: 'Manohar Joshi', phone: '+91 98220 44006', classGrade: '7', div: 'A' },
      { firstName: 'Tanvi', lastName: 'Chavan', gender: 'FEMALE', dob: '2011-11-12', guardian: 'Uttam Chavan', phone: '+91 98220 44007', classGrade: '8', div: 'A' },
      { firstName: 'Pranav', lastName: 'Gaikwad', gender: 'MALE', dob: '2011-04-01', guardian: 'Namdev Gaikwad', phone: '+91 98220 44008', classGrade: '8', div: 'B' },
      { firstName: 'Rutuja', lastName: 'Kadam', gender: 'FEMALE', dob: '2010-09-24', guardian: 'Bhimrao Kadam', phone: '+91 98220 44009', classGrade: '9', div: 'A' },
      { firstName: 'Sarthak', lastName: 'Bhosale', gender: 'MALE', dob: '2010-02-17', guardian: 'Anil Bhosale', phone: '+91 98220 44010', classGrade: '9', div: 'A' },
      { firstName: 'Isha', lastName: 'Wagh', gender: 'FEMALE', dob: '2009-06-30', guardian: 'Sharad Wagh', phone: '+91 98220 44011', classGrade: '10', div: 'A' },
      { firstName: 'Adwait', lastName: 'Deshpande', gender: 'MALE', dob: '2009-12-14', guardian: 'Makarand Deshpande', phone: '+91 98220 44012', classGrade: '10', div: 'A' },
      { firstName: 'Sai', lastName: 'Patil', gender: 'FEMALE', dob: '2014-02-28', guardian: 'Pandit Patil', phone: '+91 98220 44013', classGrade: '5', div: 'B' },
    ],
  },
  {
    name: 'Rajmata Jijau Prathamik Shala',
    slug: 'rajmata-jijau-kolhapur',
    location: 'Kolhapur, Maharashtra',
    address: 'Tarabai Park, Near Circuit House, Kolhapur, Maharashtra 416003',
    contactPhone: '+91 231 265 4321',
    contactEmail: 'kolhapur.rjp@eduvanta.org',
    principalName: 'Mrs. Meenakshi Patil (M.Sc., B.Ed.)',
    principalEmail: 'principal.kolhapur@eduvanta.local',
    principalDisplayName: 'Meenakshi Patil',
    tagline: 'Instilling Courage, Culture and Modern Education',
    description: 'Vibrant primary and middle school focused on foundational learning, sports coaching, and vernacular literature in Southern Maharashtra.',
    establishedYear: 1995,
    admissionPrefix: 'RJK-2026',
    teachers: [
      { firstName: 'Amol', lastName: 'Kadam', qualification: 'M.Sc. Mathematics, B.Ed.', employeeId: 'RJ-TCH-01' },
      { firstName: 'Snehal', lastName: 'Patil', qualification: 'M.A. Marathi & Sanskrit, B.Ed.', employeeId: 'RJ-TCH-02' },
      { firstName: 'Santosh', lastName: 'Bhosale', qualification: 'B.Sc. Environmental Science, D.Ed.', employeeId: 'RJ-TCH-03' },
    ],
    students: [
      { firstName: 'Prajakta', lastName: 'Mane', gender: 'FEMALE', dob: '2014-04-09', guardian: 'Chandrakant Mane', phone: '+91 98220 55001', classGrade: '5', div: 'A' },
      { firstName: 'Omkar', lastName: 'Shinde', gender: 'MALE', dob: '2014-11-15', guardian: 'Dattaji Shinde', phone: '+91 98220 55002', classGrade: '5', div: 'A' },
      { firstName: 'Gauri', lastName: 'Pawar', gender: 'FEMALE', dob: '2013-03-08', guardian: 'Shivram Pawar', phone: '+91 98220 55003', classGrade: '6', div: 'A' },
      { firstName: 'Vedant', lastName: 'More', gender: 'MALE', dob: '2013-09-21', guardian: 'Balwant More', phone: '+91 98220 55004', classGrade: '6', div: 'B' },
      { firstName: 'Shruti', lastName: 'Joshi', gender: 'FEMALE', dob: '2012-01-16', guardian: 'Shridhar Joshi', phone: '+91 98220 55005', classGrade: '7', div: 'A' },
      { firstName: 'Tanvi', lastName: 'Chavan', gender: 'FEMALE', dob: '2012-06-25', guardian: 'Anandrao Chavan', phone: '+91 98220 55006', classGrade: '7', div: 'A' },
      { firstName: 'Pranav', lastName: 'Gaikwad', gender: 'MALE', dob: '2011-10-14', guardian: 'Dilip Gaikwad', phone: '+91 98220 55007', classGrade: '8', div: 'A' },
      { firstName: 'Rutuja', lastName: 'Kadam', gender: 'FEMALE', dob: '2011-03-02', guardian: 'Jagdish Kadam', phone: '+91 98220 55008', classGrade: '8', div: 'B' },
      { firstName: 'Sarthak', lastName: 'Bhosale', gender: 'MALE', dob: '2010-08-19', guardian: 'Shivaji Bhosale', phone: '+91 98220 55009', classGrade: '9', div: 'A' },
      { firstName: 'Isha', lastName: 'Wagh', gender: 'FEMALE', dob: '2010-12-05', guardian: 'Gajanan Wagh', phone: '+91 98220 55010', classGrade: '9', div: 'A' },
      { firstName: 'Adwait', lastName: 'Deshpande', gender: 'MALE', dob: '2009-05-22', guardian: 'Shriniwas Deshpande', phone: '+91 98220 55011', classGrade: '10', div: 'A' },
      { firstName: 'Aarav', lastName: 'Deshmukh', gender: 'MALE', dob: '2009-10-30', guardian: 'Hanmant Deshmukh', phone: '+91 98220 55012', classGrade: '10', div: 'A' },
      { firstName: 'Sai', lastName: 'Patil', gender: 'FEMALE', dob: '2014-01-18', guardian: 'Sambhajirao Patil', phone: '+91 98220 55013', classGrade: '5', div: 'B' },
    ],
  },
];

async function seedMaharashtraSampleData() {
  console.log(`\n======================================================`);
  console.log(`🚀 EduVanta Maharashtra Sample Data Seeder`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Simulating without database writes)' : 'LIVE EXECUTION'}`);
  console.log(`Target Supabase: ${SUPABASE_URL}`);
  console.log(`======================================================\n`);

  const passwordCache = {
    principal: await bcrypt.hash('Principal@123', 10),
    teacher: await bcrypt.hash('Teacher@123', 10),
    student: await bcrypt.hash('Student@123', 10),
  };

  let totalSchoolsCreated = 0;
  let totalClassesCreated = 0;
  let totalPrincipalsCreated = 0;
  let totalTeachersCreated = 0;
  let totalStudentsCreated = 0;

  for (const s of SAMPLE_SCHOOLS) {
    console.log(`\n🏫 Processing: ${s.name} (${s.slug})...`);

    // 1. Check or Upsert School
    let schoolId = null;
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id, name')
      .eq('slug', s.slug)
      .maybeSingle();

    if (existingSchool) {
      console.log(`   ℹ️ School already exists (id: ${existingSchool.id}). Reusing.`);
      schoolId = existingSchool.id;
    } else {
      schoolId = generateCuid();
      const now = new Date().toISOString();
      if (!isDryRun) {
        const { error } = await supabase.from('schools').insert({
          id: schoolId,
          name: s.name,
          slug: s.slug,
          address: s.address,
          contact_phone: s.contactPhone,
          contact_email: s.contactEmail,
          principal_name: s.principalName,
          description: s.description,
          tagline: s.tagline,
          established_year: s.establishedYear,
          is_active: true,
          is_public_enabled: true,
          created_at: now,
          updated_at: now,
        });
        if (error) throw new Error(`Failed to create school ${s.slug}: ${error.message}`);
      }
      totalSchoolsCreated++;
      console.log(`   ✅ School created with id: ${schoolId}`);
    }

    // 2. Check or Upsert Principal
    const { data: existingPrincipalUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', s.principalEmail)
      .maybeSingle();

    if (existingPrincipalUser) {
      console.log(`   ℹ️ Principal user exists (${s.principalEmail}). Reusing.`);
    } else {
      const principalUserId = generateCuid();
      const now = new Date().toISOString();
      if (!isDryRun) {
        const { error } = await supabase.from('users').insert({
          id: principalUserId,
          email: s.principalEmail,
          name: s.principalDisplayName,
          password_hash: passwordCache.principal,
          role: 'PRINCIPAL',
          school_id: schoolId,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
        if (error) throw new Error(`Failed to create principal user: ${error.message}`);
      }
      totalPrincipalsCreated++;
      console.log(`   ✅ Principal provisioned: ${s.principalEmail}`);
    }

    // 3. Setup Classes (Grades 5 through 10, Divisions A & B)
    const classMap = {};
    const gradeLevels = ['5', '6', '7', '8', '9', '10'];
    const divisions = ['A', 'B'];

    for (const grade of gradeLevels) {
      for (const div of divisions) {
        const className = `Class ${grade}`;
        const classKey = `${grade}-${div}`;

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
          if (!isDryRun) {
            const { error } = await supabase.from('classes').insert({
              id: classId,
              school_id: schoolId,
              name: className,
              division: div,
              academic_year: '2026-2027',
              is_active: true,
              created_at: now,
              updated_at: now,
            });
            if (error) throw new Error(`Failed to create class ${className} ${div}: ${error.message}`);
          }
          classMap[classKey] = classId;
          totalClassesCreated++;
        }
      }
    }
    console.log(`   ✅ Classes 5 through 10 (Div A & B) verified.`);

    // 4. Setup Teachers
    for (const t of s.teachers) {
      const teacherEmail = `teacher.${t.firstName.toLowerCase()}.${t.lastName.toLowerCase()}.${s.slug.replace(/-/g, '')}@eduvanta.teacher`;

      const { data: existingTeacherUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', teacherEmail)
        .maybeSingle();

      let teacherUserId = existingTeacherUser ? existingTeacherUser.id : null;

      if (!existingTeacherUser) {
        teacherUserId = generateCuid();
        const now = new Date().toISOString();
        if (!isDryRun) {
          const { error } = await supabase.from('users').insert({
            id: teacherUserId,
            email: teacherEmail,
            name: `${t.firstName} ${t.lastName}`,
            password_hash: passwordCache.teacher,
            role: 'TEACHER',
            school_id: schoolId,
            is_active: true,
            created_at: now,
            updated_at: now,
          });
          if (error) throw new Error(`Failed to create teacher user ${teacherEmail}: ${error.message}`);
        }
      }

      // Check Teacher record
      const { data: existingTeacherRecord } = await supabase
        .from('teachers')
        .select('id')
        .eq('school_id', schoolId)
        .eq('user_id', teacherUserId)
        .maybeSingle();

      if (!existingTeacherRecord) {
        const teacherId = generateCuid();
        const now = new Date().toISOString();
        if (!isDryRun) {
          const { error } = await supabase.from('teachers').insert({
            id: teacherId,
            school_id: schoolId,
            user_id: teacherUserId,
            employee_id: t.employeeId,
            first_name: t.firstName,
            last_name: t.lastName,
            qualification: t.qualification,
            is_active: true,
            created_at: now,
            updated_at: now,
          });
          if (error) throw new Error(`Failed to create teacher record: ${error.message}`);
        }
        totalTeachersCreated++;
      }
    }
    console.log(`   ✅ 3 Teachers verified.`);

    // 5. Setup Students (13 per school)
    let studentIndex = 1;
    for (const st of s.students) {
      const admissionNumber = `${s.admissionPrefix}-${String(studentIndex).padStart(3, '0')}`;
      studentIndex++;

      const studentEmail = `${st.firstName.toLowerCase()}.${st.lastName.toLowerCase()}.${s.slug.replace(/-/g, '')}${String(studentIndex).padStart(2, '0')}@eduvanta.student`;

      const classId = classMap[`${st.classGrade}-${st.div}`] || null;

      // Check if student exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', schoolId)
        .eq('admission_number', admissionNumber)
        .maybeSingle();

      if (!existingStudent) {
        // Create user account for student
        let studentUserId = null;
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', studentEmail)
          .maybeSingle();

        if (existingUser) {
          studentUserId = existingUser.id;
        } else {
          studentUserId = generateCuid();
          const now = new Date().toISOString();
          if (!isDryRun) {
            const { error: userErr } = await supabase.from('users').insert({
              id: studentUserId,
              email: studentEmail,
              name: `${st.firstName} ${st.lastName}`,
              password_hash: passwordCache.student,
              role: 'STUDENT',
              school_id: schoolId,
              is_active: true,
              created_at: now,
              updated_at: now,
            });
            if (userErr) throw new Error(`Failed to create student user ${studentEmail}: ${userErr.message}`);
          }
        }

        const studentId = generateCuid();
        const now = new Date().toISOString();
        if (!isDryRun) {
          const { error: stErr } = await supabase.from('students').insert({
            id: studentId,
            school_id: schoolId,
            user_id: studentUserId,
            admission_number: admissionNumber,
            first_name: st.firstName,
            last_name: st.lastName,
            date_of_birth: new Date(st.dob).toISOString(),
            gender: st.gender,
            address: `${s.location}`,
            guardian_name: st.guardian,
            guardian_phone: st.phone,
            academic_year: '2026-2027',
            class_id: classId,
            is_active: true,
            created_at: now,
            updated_at: now,
          });
          if (stErr) throw new Error(`Failed to create student record ${admissionNumber}: ${stErr.message}`);
        }
        totalStudentsCreated++;
      }
    }
    console.log(`   ✅ 13 Sample Maharashtrian Students verified.`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 SUMMARY OF SEEDING:`);
  console.log(`  Schools Processed: ${SAMPLE_SCHOOLS.length}`);
  console.log(`  New Schools: ${totalSchoolsCreated}`);
  console.log(`  New Classes: ${totalClassesCreated}`);
  console.log(`  New Principals: ${totalPrincipalsCreated}`);
  console.log(`  New Teachers: ${totalTeachersCreated}`);
  console.log(`  New Students: ${totalStudentsCreated}`);
  console.log(`  Idempotent: YES (Safe to re-run anytime)`);
  console.log(`======================================================\n`);
}

if (require.main === module) {
  seedMaharashtraSampleData().catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedMaharashtraSampleData, SAMPLE_SCHOOLS };
