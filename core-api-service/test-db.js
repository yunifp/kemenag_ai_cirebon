const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const docs = await prisma.knowledgeDocument.findMany({ select: { title: true, status: true, metadata: true } });
  console.log(docs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
