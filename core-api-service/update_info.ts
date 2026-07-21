import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existingInfo = await prisma.botMenu.findUnique({ where: { keyword: 'info' } });
  
  if (existingInfo) {
    let newResponse = 'Halo Sahabat! Kenalkan, aku Zawa (Asisten Virtual Kemenag Kabupaten Cirebon). Zawa siap membantu memberikan informasi seputar layanan di Kemenag Cirebon.\n\nBerikut adalah layanan yang tersedia. Balas pesan ini dengan mengetikkan salah satu kata kunci di bawah:\n';
    
    // Extract existing categories
    const lines = existingInfo.response.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('👉')) {
        newResponse += '\n' + line.trim();
      }
    }
    
    newResponse += '\n\nAtau jika informasi yang dicari tidak ada di atas, silakan langsung ketikkan pertanyaan Anda secara bebas!';

    await prisma.botMenu.update({
      where: { keyword: 'info' },
      data: { response: newResponse }
    });
    console.log('Info menu updated successfully.');
  }
}

main().finally(() => prisma.$disconnect());
