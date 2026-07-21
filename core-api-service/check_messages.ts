import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.chatMessage.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10
  });
  console.log(messages.reverse());
}

main().finally(() => prisma.$disconnect());
