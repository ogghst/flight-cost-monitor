import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('Starting database seed...')

  try {
    // Create default roles
    console.log('Creating roles...')
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
          name: 'ADMIN',
          description: 'Administrator role with full access',
        },
      }),
      prisma.role.upsert({
        where: { name: 'USER' },
        update: {},
        create: {
          name: 'USER',
          description: 'Regular user role',
        },
      }),
      prisma.role.upsert({
        where: { name: 'API_USER' },
        update: {},
        create: {
          name: 'API_USER',
          description: 'API access role',
        },
      }),
    ])

    console.log(`Created ${roles.length} roles`)

    // Create default permissions
    console.log('Creating permissions...')
    const permissions = await Promise.all([
      prisma.permission.upsert({
        where: { name: 'user:read' },
        update: {},
        create: {
          name: 'user:read',
          description: 'Can read user data',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'user:write' },
        update: {},
        create: {
          name: 'user:write',
          description: 'Can modify user data',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'flight:read' },
        update: {},
        create: {
          name: 'flight:read',
          description: 'Can read flight data',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'flight:write' },
        update: {},
        create: {
          name: 'flight:write',
          description: 'Can modify flight data',
        },
      }),
    ])

    console.log(`Created ${permissions.length} permissions`)

    // Assign permissions to roles
    console.log('Assigning permissions to roles...')

    // Find roles and permissions by name for type safety
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } })
    const userRole = await prisma.role.findUnique({ where: { name: 'USER' } })
    const apiRole = await prisma.role.findUnique({
      where: { name: 'API_USER' },
    })

    if (adminRole && userRole && apiRole) {
      await Promise.all([
        // Admin gets all permissions
        prisma.role.update({
          where: { id: adminRole.id },
          data: {
            permissions: {
              connect: permissions.map((p) => ({ id: p.id })),
            },
          },
        }),
        // Regular user gets read permissions
        prisma.role.update({
          where: { id: userRole.id },
          data: {
            permissions: {
              connect: permissions
                .filter((p) => p.name.endsWith(':read'))
                .map((p) => ({ id: p.id })),
            },
          },
        }),
        // API user gets flight permissions
        prisma.role.update({
          where: { id: apiRole.id },
          data: {
            permissions: {
              connect: permissions
                .filter((p) => p.name.startsWith('flight:'))
                .map((p) => ({ id: p.id })),
            },
          },
        }),
      ])
    }

    // Create test users
    console.log('Creating test users...')

    const users = await Promise.all([
      // Admin user
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          email: 'admin@example.com',
          username: 'admin',
          password: await hashPassword('Admin123!'),
          firstName: 'Admin',
          lastName: 'User',
          authType: 'CREDENTIALS',
          active: true,
          roles: {
            connect: [{ name: 'ADMIN' }],
          },
        },
      }),
      // Regular user
      prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
          email: 'user@example.com',
          username: 'user',
          password: await hashPassword('User123!'),
          firstName: 'Regular',
          lastName: 'User',
          authType: 'CREDENTIALS',
          active: true,
          roles: {
            connect: [{ name: 'USER' }],
          },
        },
      }),
      // API user
      prisma.user.upsert({
        where: { email: 'api@example.com' },
        update: {},
        create: {
          email: 'api@example.com',
          username: 'api_user',
          password: await hashPassword('Api123!'),
          firstName: 'API',
          lastName: 'User',
          authType: 'CREDENTIALS',
          active: true,
          roles: {
            connect: [{ name: 'API_USER' }],
          },
        },
      }),
      // Example OAuth user
      prisma.user.upsert({
        where: { email: 'oauth@example.com' },
        update: {},
        create: {
          email: 'oauth@example.com',
          username: 'oauth_user',
          firstName: 'OAuth',
          lastName: 'User',
          authType: 'OAUTH',
          oauthProvider: 'GITHUB',
          oauthProviderId: '12345',
          oauthProfile: JSON.stringify({
            login: 'oauth_user',
            avatar_url: 'https://github.com/ghost.png',
          }),
          active: true,
          roles: {
            connect: [{ name: 'USER' }],
          },
        },
      }),
    ])

    console.log(`Created ${users.length} users`)
    console.log('Seed completed successfully')
  } catch (error) {
    console.error('Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
