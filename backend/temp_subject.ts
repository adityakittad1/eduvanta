import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findFirst();
  if (!school) return;

  const cls = await prisma.class.findFirst({ where: { schoolId: school.id, name: 'Class 5' } });
  if (!cls) return;

  const existingSubject = await prisma.subject.findFirst({ where: { classId: cls.id } });
  if (!existingSubject) {
    await prisma.subject.createMany({
      data: [
        { classId: cls.id, name: 'Mathematics', code: 'MATH', schoolId: school.id },
        { classId: cls.id, name: 'Science', code: 'SCI', schoolId: school.id },
        { classId: cls.id, name: 'English', code: 'ENG', schoolId: school.id }
      ]
    });
    console.log('✅ Added subjects to Class 5');
  } else {
    console.log('✅ Subjects already exist');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
