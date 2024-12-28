import { UserRepository } from '@fcm/storage'
import { prisma } from './db'

export const userRepository = new UserRepository(prisma)
