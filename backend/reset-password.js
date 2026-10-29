const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('Eduvanta@123', 10);
  await prisma.user.update({
    where: { email: 'shinde@gmail.com' },
    data: { passwordHash: hash }
  });
  console.log('Password reset successfully to Eduvanta@123');
}
main().catch(console.error).finally(() => prisma.$disconnect());
