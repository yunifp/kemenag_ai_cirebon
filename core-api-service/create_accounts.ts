import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Ensure Roles
  const superadminRole = await prisma.role.findFirst({ where: { name: 'SUPERADMIN' } });
  
  let csRole = await prisma.role.findFirst({ where: { name: 'CS_TICKETING' } });
  if (!csRole) {
    csRole = await prisma.role.create({ data: { name: 'CS_TICKETING', isIsolatedData: false, isDeletable: true } });
  }

  // 2. Ensure Permissions for CS (Dashboard & Ticketing)
  const dashboardMenu = await prisma.menu.findFirst({ where: { name: 'Dashboard' } });
  const ticketingMenu = await prisma.menu.findFirst({ where: { name: 'Ticketing (CS)' } });
  const readPerm = await prisma.permission.findFirst({ where: { name: 'READ' } });
  const updatePerm = await prisma.permission.findFirst({ where: { name: 'UPDATE' } });
  const createPerm = await prisma.permission.findFirst({ where: { name: 'CREATE' } });

  if (csRole && dashboardMenu && ticketingMenu && readPerm) {
    // Assign READ to dashboard and ticketing
    await prisma.rolePermission.upsert({
      where: { roleId_menuId_permissionId: { roleId: csRole.id, menuId: dashboardMenu.id, permissionId: readPerm.id } },
      update: {}, create: { roleId: csRole.id, menuId: dashboardMenu.id, permissionId: readPerm.id }
    });
    await prisma.rolePermission.upsert({
      where: { roleId_menuId_permissionId: { roleId: csRole.id, menuId: ticketingMenu.id, permissionId: readPerm.id } },
      update: {}, create: { roleId: csRole.id, menuId: ticketingMenu.id, permissionId: readPerm.id }
    });
    await prisma.rolePermission.upsert({
      where: { roleId_menuId_permissionId: { roleId: csRole.id, menuId: ticketingMenu.id, permissionId: updatePerm!.id } },
      update: {}, create: { roleId: csRole.id, menuId: ticketingMenu.id, permissionId: updatePerm!.id }
    });
  }

  // 3. Upsert Superadmin User
  await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password: 'Superadmin123!' },
    create: {
      username: 'superadmin',
      email: 'superadmin@kemenag.go.id',
      password: 'Superadmin123!',
      name: 'Superadmin Utama',
      roleId: superadminRole!.id,
    }
  });

  // 4. Upsert Admin CS User
  await prisma.user.upsert({
    where: { username: 'admincs' },
    update: { password: 'Admincs123!' },
    create: {
      username: 'admincs',
      email: 'cs@kemenag.go.id',
      password: 'Admincs123!',
      name: 'Admin Ticketing',
      roleId: csRole!.id,
    }
  });

  console.log('Accounts created successfully');
}

main().finally(() => prisma.$disconnect());
