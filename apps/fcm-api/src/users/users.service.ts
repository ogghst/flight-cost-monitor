import { CreateUserDto } from '@/users/dto/create-user.dto.js'
import { UpdateUserDto } from '@/users/dto/update-user.dto.js'
import { userRepository } from '@fcm/storage/repositories'
import { DatabaseError } from '@fcm/storage/schema'
import { Injectable, NotFoundException } from '@nestjs/common'

@Injectable()
export class UsersService {
  // The service uses the userRepository from fcm-storage to perform database operations
  constructor() {}

  async findById(id: string) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async findByEmail(email: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`)
    }
    return user
  }

  async create(createUserDto: CreateUserDto) {
    try {
      return await userRepository.create(createUserDto)
    } catch (error: unknown) {
      if (
        error instanceof DatabaseError &&
        (error as DatabaseError).code === 'UNIQUE_CONSTRAINT'
      ) {
        throw new Error('User with this email already exists')
      }
      throw error
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await userRepository.update(id, updateUserDto)
    } catch (error) {
      if (error instanceof DatabaseError) {
        if ((error as DatabaseError).code === 'NOT_FOUND') {
          throw new NotFoundException(`User with ID ${id} not found`)
        }
        if ((error as DatabaseError).code === 'UNIQUE_CONSTRAINT') {
          throw new Error('Email already in use')
        }
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      await userRepository.softDelete(id)
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        (error as DatabaseError).code === 'NOT_FOUND'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`)
      }
      throw error
    }
  }

  async restore(id: string) {
    try {
      return await userRepository.restore(id)
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        (error as DatabaseError).code === 'NOT_FOUND'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`)
      }
      throw error
    }
  }
}
