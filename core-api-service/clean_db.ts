import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Menghapus semua KnowledgeDocumentChunk...');
  await prisma.$executeRaw`DELETE FROM "KnowledgeDocumentChunk"`;
  
  console.log('Menghapus semua KnowledgeDocument...');
  await prisma.knowledgeDocument.deleteMany({});
  
  console.log('Menghapus semua BotMenu kecuali info...');
  await prisma.botMenu.deleteMany({
    where: {
      keyword: { not: 'info' }
    }
  });

  console.log('Menghapus riwayat ChatSession untuk mencegah error state...');
  await prisma.chatMessage.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.chatSession.deleteMany({});

  // Reset info menu
  await prisma.botMenu.upsert({
    where: { keyword: 'info' },
    update: {
      response: 'Kementerian Agama (Kemenag) RI adalah kementerian yang bertugas menyelenggarakan pemerintahan di bidang agama.\n\nBerikut adalah layanan yang tersedia. Balas pesan ini dengan mengetikkan salah satu kata kunci di bawah:\n',
    },
    create: {
      keyword: 'info',
      title: 'Informasi Umum',
      response: 'Kementerian Agama (Kemenag) RI adalah kementerian yang bertugas menyelenggarakan pemerintahan di bidang agama.\n\nBerikut adalah layanan yang tersedia. Balas pesan ini dengan mengetikkan salah satu kata kunci di bawah:\n',
      isActive: true
    }
  });

  console.log('Proses cleansing database selesai!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
