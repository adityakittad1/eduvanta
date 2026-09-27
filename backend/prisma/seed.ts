import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create a default SUPER_ADMIN user if none exists
  const superAdminEmail = 'admin@zpschoolerp.com';
  let superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!superAdmin) {
    console.log(`Creating default SUPER_ADMIN (${superAdminEmail})...`);
    const passwordHash = await bcrypt.hash('Admin@1234', 10);
    
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Default SUPER_ADMIN created.');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: Admin@1234`);
  } else {
    console.log(`✅ SUPER_ADMIN (${superAdminEmail}) already exists.`);
  }

  console.log('🎉 Seeding finished.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
