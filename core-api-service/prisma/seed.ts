import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');
  
  // 1. Create Default User
  await prisma.user.upsert({
    where: { email: 'admin@kemenag.go.id' },
    update: {},
    create: {
      email: 'admin@kemenag.go.id',
      username: 'admin',
      password: 'password123', // should be hashed in real app
      name: 'Admin Pusat',
      picName: 'Admin',
      nik: '1234567890123456',
      position: 'Superadmin',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
