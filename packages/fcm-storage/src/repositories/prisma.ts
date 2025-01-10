import { PrismaClient } from '@prisma/client'
import { auditExtension } from './extensions/audit.js'

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
  return client.$extends(auditExtension)
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>
export type ExtendedTransactionClient = Omit<
  ExtendedPrismaClient,
  '$transaction' | '$connect' | '$disconnect' | '$on' | '$use'
>

export const fcmPrismaClient = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = fcmPrismaClient
}
