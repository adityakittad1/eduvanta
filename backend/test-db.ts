import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  console.log(users.map(u => u.email));
}
main().finally(() => prisma.$disconnect());
