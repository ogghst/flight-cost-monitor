import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.PermissionType.create({
    data: {
      id: 'READ',
    },
  })
  await prisma.PermissionType.create({
    data: {
      id: 'WRITE',
    },
  })

  // Create admin role
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      description: 'Administrator role with full access',
      permissions: {
        connect: [{ id: 'READ' }, { id: 'WRITE' }],
      },
    },
  })

  // Create user role
  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      description: 'Regular user with basic access',
      permissions: {
        connect: [{ id: 'READ' }],
      },
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

  console.log('Database has been seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
