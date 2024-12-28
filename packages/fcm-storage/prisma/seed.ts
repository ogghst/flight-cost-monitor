import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create permission types
  await prisma.permissionType.upsert({
    where: { id: 'READ' },
    update: {},
    create: { id: 'READ' },
  })

  await prisma.permissionType.upsert({
    where: { id: 'WRITE' },
    update: {},
    create: { id: 'WRITE' },
  })

  // Create admin role first
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator role with full access',
    },
  })

  // Create user role
  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Regular user with basic access',
    },
  })

  // Create permissions for admin role
  await prisma.permission.create({
    data: {
      typeId: 'READ',
      roleId: adminRole.id,
      resource: '*',
    },
  })

  await prisma.permission.create({
    data: {
      typeId: 'WRITE',
      roleId: adminRole.id,
      resource: '*',
    },
  })

  // Create permissions for user role
  await prisma.permission.create({
    data: {
      typeId: 'READ',
      roleId: userRole.id,
      resource: 'flights',
    },
  })

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@fcm.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      firstName: 'Admin',
      lastName: 'User',
      roles: {
        connect: [{ id: adminRole.id }],
      },
    },
  })

  // Create regular user
  await prisma.user.create({
    data: {
      email: 'user@fcm.com',
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password123'
      firstName: 'Regular',
      lastName: 'User',
      roles: {
        connect: [{ id: userRole.id }],
      },
    },
  })

  console.log('Database has been seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
