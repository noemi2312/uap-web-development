import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: { name: 'Test', email: 'test@example.com', password: '1234' }
  });
  console.log(user);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
