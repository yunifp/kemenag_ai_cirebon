import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.botMenu.upsert({
    where: { keyword: 'zakat' },
    update: {
      response: 'Anda telah memilih layanan informasi *Zakat*.\n\nSaran pertanyaan (ketik salah satu):\n👉 Syarat zakat fitrah\n👉 Cara bayar zakat\n👉 Niat zakat maal\n👉 Menu (untuk kembali ke awal)\n\nAtau silakan ketik pertanyaan Anda secara bebas, dan AI kami akan membacakan jawabannya dari pedoman resmi kami.',
    },
    create: {
      keyword: 'zakat', title: 'Layanan Zakat',
      response: 'Anda telah memilih layanan informasi *Zakat*.\n\nSaran pertanyaan (ketik salah satu):\n👉 Syarat zakat fitrah\n👉 Cara bayar zakat\n👉 Niat zakat maal\n👉 Menu (untuk kembali ke awal)\n\nAtau silakan ketik pertanyaan Anda secara bebas, dan AI kami akan membacakan jawabannya dari pedoman resmi kami.',
    }
  });

  await prisma.botMenu.upsert({
    where: { keyword: 'haji' },
    update: {
      response: 'Anda telah memilih layanan informasi *Haji*.\n\nSaran pertanyaan (ketik salah satu):\n👉 Syarat daftar haji\n👉 Biaya pelunasan haji\n👉 Prosedur pembatalan\n👉 Menu (untuk kembali ke awal)\n\nAtau silakan ketik pertanyaan Anda secara bebas, dan AI kami akan membacakan jawabannya dari pedoman resmi kami.',
    },
    create: {
      keyword: 'haji', title: 'Layanan Haji',
      response: 'Anda telah memilih layanan informasi *Haji*.\n\nSaran pertanyaan (ketik salah satu):\n👉 Syarat daftar haji\n👉 Biaya pelunasan haji\n👉 Prosedur pembatalan\n👉 Menu (untuk kembali ke awal)\n\nAtau silakan ketik pertanyaan Anda secara bebas, dan AI kami akan membacakan jawabannya dari pedoman resmi kami.',
    }
  });

  await prisma.botMenu.upsert({
    where: { keyword: 'pernikahan' },
    update: {
      response: 'Anda telah memilih layanan informasi *Pernikahan*.\n\nSaran pertanyaan (ketik salah satu):\n👉 Syarat nikah di KUA\n👉 Biaya nikah di luar KUA\n👉 Prosedur daftar nikah\n👉 Menu (untuk kembali ke awal)\n\nAtau silakan ketik pertanyaan Anda secara bebas, dan AI kami akan membacakan jawabannya dari pedoman resmi kami.',
    },
    create: {
      keyword: 'pernikahan', title: 'Layanan Pernikahan',
      response: 'Anda telah memilih layanan informasi *Pernikahan*.\n\nSaran pertanyaan (ketik salah satu):\n👉 Syarat nikah di KUA\n👉 Biaya nikah di luar KUA\n👉 Prosedur daftar nikah\n👉 Menu (untuk kembali ke awal)\n\nAtau silakan ketik pertanyaan Anda secara bebas, dan AI kami akan membacakan jawabannya dari pedoman resmi kami.',
    }
  });

  console.log('BotMenu updated successfully.');
}

main().finally(() => prisma.$disconnect());
