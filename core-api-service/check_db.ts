import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const menus = await prisma.botMenu.findMany({ where: { isActive: true } });
  console.log(menus);
}
main().finally(() => prisma.$disconnect());
