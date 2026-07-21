import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existingInfo = await prisma.botMenu.findUnique({ where: { keyword: 'info' } });
  
  if (existingInfo) {
    const newResponse = 'Halo Sahabat! Kenalkan, aku Zawa (Asisten Virtual Kemenag Kabupaten Cirebon). Zawa siap membantu memberikan informasi seputar layanan di Kemenag Cirebon.\n\nBerikut adalah layanan yang tersedia. Balas pesan ini dengan mengetikkan salah satu angka di bawah:';

    await prisma.botMenu.update({
      where: { keyword: 'info' },
      data: { response: newResponse }
    });
    console.log('Info menu cleaned up successfully.');
  }
}

main().finally(() => prisma.$disconnect());
