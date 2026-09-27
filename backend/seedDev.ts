import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DEV seeding...');

  // 1. Create School
  let school = await prisma.school.findFirst();
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: 'ZP High School',
        address: 'Main Street, Village Area',
        principalName: 'Dr. Principal',
        contactEmail: 'contact@zphighschool.com'
      }
    });
    console.log('✅ Created School:', school.name);
  } else {
    console.log('✅ School already exists:', school.name);
  }

  // 2. Create Principal
  const principalEmail = 'school.principal@example.com';
  let principal = await prisma.user.findUnique({ where: { email: principalEmail } });
  const passwordHash = await bcrypt.hash('Password@123', 10);
  
  if (!principal) {
    principal = await prisma.user.create({
      data: {
        email: principalEmail,
        passwordHash,
        role: 'PRINCIPAL',
        schoolId: school.id,
        isActive: true
      }
    });
    console.log(`✅ Created Principal: ${principalEmail} / Password@123`);
  }

  // 3. Create Teacher
  const teacherEmail = 'teacher@example.com';
  let teacherUser = await prisma.user.findUnique({ where: { email: teacherEmail } });
  if (!teacherUser) {
    teacherUser = await prisma.user.create({
      data: {
        email: teacherEmail,
        passwordHash,
        role: 'TEACHER',
        schoolId: school.id,
        isActive: true
      }
    });
    
    await prisma.teacher.create({
      data: {
        schoolId: school.id,
        userId: teacherUser.id,
        employeeId: 'T001',
        firstName: 'John',
        lastName: 'Doe',
        qualification: 'B.Ed'
      }
    });
    console.log(`✅ Created Teacher: ${teacherEmail} / Password@123`);
  }

  // 4. Create Class for Student
  let cls = await prisma.class.findFirst({ where: { schoolId: school.id } });
  if (!cls) {
    cls = await prisma.class.create({
      data: {
        schoolId: school.id,
        name: 'Class 5',
        division: 'A',
        academicYear: '2026-2027'
      }
    });
  }

  // 5. Create Student
  const studentEmail = 'student@example.com';
  let studentUser = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        passwordHash,
        role: 'STUDENT',
        schoolId: school.id,
        isActive: true
      }
    });

    await prisma.student.create({
      data: {
        schoolId: school.id,
        userId: studentUser.id,
        admissionNumber: 'S001',
        firstName: 'Alice',
        lastName: 'Student',
        classId: cls.id,
        academicYear: '2026-2027',
        enrollmentDate: new Date()
      }
    });
    console.log(`✅ Created Student: ${studentEmail} / Password@123`);
  }

  console.log('🎉 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
