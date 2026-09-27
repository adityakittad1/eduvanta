import 'dotenv/config';
import { PrismaClient, Role, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SCHOOLS = [
  {
    name: 'GPTPS Gangapur',
    slug: 'gptps-gangapur',
    address: 'Gangapur Village, Wardha District, Maharashtra',
    contactEmail: 'contact@gptps-gangapur.eduvanta.local',
    contactPhone: '+91 9876543210',
    principalName: 'Ramesh Sharma',
    tagline: 'Empowering Rural Minds',
    establishedYear: 1985,
  },
  {
    name: 'Ellora High School',
    slug: 'ellora-highschool',
    address: 'Aurangabad, Maharashtra',
    contactEmail: 'info@ellora-highschool.eduvanta.local',
    contactPhone: '+91 9876543211',
    principalName: 'Priya Deshmukh',
    tagline: 'Excellence in Education',
    establishedYear: 1990,
  },
  {
    name: 'Karmad ZP School',
    slug: 'karmad-zp',
    address: 'Karmad, Maharashtra',
    contactEmail: 'hello@karmad.eduvanta.local',
    contactPhone: '+91 9876543212',
    principalName: 'Sanjay Patil',
    tagline: 'Building the Future',
    establishedYear: 1978,
  }
];

const DEFAULT_CLASSES = ['1', '2', '3', '4', '5'];
const DEFAULT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Marathi'];

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting demo data seeding...');

  const defaultPassword = await hash('Eduvanta@123');

  // 1. Super Admin
  const superAdminEmail = 'admin@zpschoolerp.com';
  let superAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });
  if (!superAdmin) {
    console.log('Creating Super Admin...');
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: defaultPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        name: 'Super Admin'
      }
    });
  }

  // 2. Schools and their dependencies
  for (const schoolData of SCHOOLS) {
    console.log(`Processing school: ${schoolData.name}`);
    let school = await prisma.school.findUnique({ where: { slug: schoolData.slug } });
    if (!school) {
      school = await prisma.school.create({ data: schoolData });
      console.log(`Created school: ${school.name}`);
    } else {
      console.log(`School ${school.name} already exists.`);
    }

    // Principal
    const principalEmail = `principal.${school.slug.replace(/-/g, '')}@eduvanta.local`;
    let principalUser = await prisma.user.findUnique({ where: { email: principalEmail } });
    if (!principalUser) {
      principalUser = await prisma.user.create({
        data: {
          email: principalEmail,
          passwordHash: defaultPassword,
          role: 'PRINCIPAL',
          schoolId: school.id,
          name: schoolData.principalName,
          isActive: true
        }
      });
      console.log(`Created principal: ${principalEmail}`);
    }

    // Classes & Subjects
    for (const className of DEFAULT_CLASSES) {
      let cls = await prisma.class.findFirst({
        where: { schoolId: school.id, name: `Class ${className}`, division: 'A', academicYear: '2026-2027' }
      });
      if (!cls) {
        cls = await prisma.class.create({
          data: {
            schoolId: school.id,
            name: `Class ${className}`,
            division: 'A',
            academicYear: '2026-2027'
          }
        });
      }
      for (const subjectName of DEFAULT_SUBJECTS) {
        let subject = await prisma.subject.findFirst({
          where: { schoolId: school.id, classId: cls.id, name: subjectName }
        });
        if (!subject) {
          await prisma.subject.create({
            data: {
              schoolId: school.id,
              classId: cls.id,
              name: subjectName,
              code: subjectName.substring(0, 3).toUpperCase()
            }
          });
        }
      }
    }

    // Teacher
    const teacherEmail = `teacher.amit.${school.slug.replace(/-/g, '')}@eduvanta.local`;
    let teacherUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
    let teacher;
    if (!teacherUser) {
      teacherUser = await prisma.user.create({
        data: {
          email: teacherEmail,
          passwordHash: defaultPassword,
          role: 'TEACHER',
          schoolId: school.id,
          name: 'Amit Kumar',
          isActive: true
        }
      });
      teacher = await prisma.teacher.create({
        data: {
          schoolId: school.id,
          userId: teacherUser.id,
          firstName: 'Amit',
          lastName: 'Kumar',
          employeeId: 'T-001'
        }
      });
      console.log(`Created teacher: ${teacherEmail}`);
    } else {
      teacher = await prisma.teacher.findUnique({ where: { userId: teacherUser.id } });
    }

    // Assign teacher to Class 1, Math
    const class1 = await prisma.class.findFirst({ where: { schoolId: school.id, name: 'Class 1' } });
    const math = await prisma.subject.findFirst({ where: { schoolId: school.id, classId: class1?.id, name: 'Mathematics' } });
    
    if (class1 && math && teacher) {
      const existingAssignment = await prisma.teacherClassSubject.findFirst({
        where: { teacherId: teacher.id, classId: class1.id, subjectId: math.id, academicYear: '2026-2027' }
      });
      if (!existingAssignment) {
        await prisma.teacherClassSubject.create({
          data: {
            schoolId: school.id,
            teacherId: teacher.id,
            classId: class1.id,
            subjectId: math.id,
            academicYear: '2026-2027'
          }
        });
      }
    }

    // Student
    const studentEmail = `student.rahul.${school.slug.replace(/-/g, '')}@eduvanta.local`;
    let studentUser = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: studentEmail,
          passwordHash: defaultPassword,
          role: 'STUDENT',
          schoolId: school.id,
          name: 'Rahul Joshi',
          isActive: true
        }
      });
      await prisma.student.create({
        data: {
          schoolId: school.id,
          userId: studentUser.id,
          admissionNumber: 'ADM-001',
          firstName: 'Rahul',
          lastName: 'Joshi',
          gender: 'MALE',
          academicYear: '2026-2027',
          classId: class1?.id
        }
      });
      console.log(`Created student: ${studentEmail}`);
    }

    // Public Facilities
    const facilities = [
      { name: 'Computer Lab', icon: 'monitor' },
      { name: 'Library', icon: 'book' },
      { name: 'Playground', icon: 'activity' }
    ];
    for (const fac of facilities) {
      const exist = await prisma.schoolFacility.findFirst({ where: { schoolId: school.id, name: fac.name } });
      if (!exist) {
        await prisma.schoolFacility.create({
          data: { schoolId: school.id, name: fac.name, icon: fac.icon, description: `Well-equipped ${fac.name}` }
        });
      }
    }
  }

  console.log('✅ Demo seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
