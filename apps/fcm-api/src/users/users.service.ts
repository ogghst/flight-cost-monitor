import { AuthType } from '@fcm/shared/types'
// @ts-ignore - Temporarily ignore missing module types
import { userRepository } from '@fcm/storage'
// @ts-ignore - Temporarily ignore missing module types
import { DatabaseError } from '@fcm/storage/schema'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { hash } from 'bcrypt'
import {
  CreateUserWithCredentialsDtoSwagger,
  CreateUserWithOAuthDtoSwagger,
} from './dto/create-user.dto.js'
import { UpdateUserDtoSwagger } from './dto/update-user.dto.js'
import { UserWithRelationsDtoSwagger } from './dto/user.dto.js'

// Define interface for database error
interface IDatabaseError extends Error {
  code: string
}

@Injectable()
export class UsersService {
  async findById(id: string): Promise<UserWithRelationsDtoSwagger> {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async findByEmail(email: string): Promise<UserWithRelationsDtoSwagger> {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`)
    }
    return user
  }

  async updateLastLogin(id: string) {
    try {
      await userRepository.updateLastLogin(id)
    } catch (error) {
      throw new BadRequestException('Failed to update last login', error)
    }
  }

  async findByUsername(username: string): Promise<UserWithRelationsDtoSwagger> {
    const user = await userRepository.findByUsername(username)
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`)
    }
    return user
  }

  async findByOAuth(
    provider: string,
    providerId: string
  ): Promise<UserWithRelationsDtoSwagger> {
    const user = await userRepository.findByOAuth(provider, providerId)
    if (!user) {
      throw new NotFoundException(
        `User with provider ${provider} and providerId ${providerId} not found`
      )
    }
    return user
  }

  async createWithCredentials(
    data: CreateUserWithCredentialsDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    try {
      // Check if email is already in use
      const existingEmail = await userRepository.findByEmail(data.email)
      if (existingEmail) {
        throw new ConflictException('Email already in use')
      }

      // Check if username is already in use
      if (data.username) {
        const existingUsername = await userRepository.findByUsername(
          data.username
        )
        if (existingUsername) {
          throw new ConflictException('Username already in use')
        }
      }

      // Hash password and create user
      const hashedPassword = await hash(data.password, 10)
      return await userRepository.createCredentialsUser({
        ...data,
        password: hashedPassword,
        authType: AuthType.CREDENTIAL,
        active: true,
      })
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      if (error instanceof DatabaseError) {
        // Type assertion to access the code property
        const dbError = error as IDatabaseError
        if (dbError.code === 'UNIQUE_CONSTRAINT') {
          throw new ConflictException(
            'User with this email or username already exists'
          )
        }
      }
      throw new BadRequestException('Failed to create user')
    }
  }

  async createWithOAuth(
    data: CreateUserWithOAuthDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    try {
      // Check if OAuth user already exists
      const existingOAuth = await userRepository.findByOAuth(
        data.oauthProvider,
        data.oauthProviderId
      )
      if (existingOAuth) {
        throw new ConflictException('OAuth user already exists')
      }

      // Check if email is already in use by a credentials user
      const existingEmail = await userRepository.findByEmail(data.email)
      if (existingEmail && existingEmail.authType === AuthType.CREDENTIAL) {
        throw new ConflictException(
          'Email already in use by a credentials user'
        )
      }

      // Check if username is already in use
      if (data.username) {
        const existingUsername = await userRepository.findByUsername(
          data.username
        )
        if (existingUsername) {
          throw new ConflictException('Username already in use')
        }
      }

      // Create OAuth user
      if (!data.oauthProvider || !data.oauthProviderId) {
        throw new BadRequestException(
          'OAuth provider and providerId are required'
        )
      }
      return await userRepository.createOAuthUser({
        ...data,
        authType: AuthType.OAUTH,
        active: true,
        oauthProvider: data.oauthProvider,
        oauthProviderId: data.oauthProviderId,
      })
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error
      }
      if (error instanceof DatabaseError) {
        // Type assertion to access the code property
        const dbError = error as IDatabaseError
        if (dbError.code === 'UNIQUE_CONSTRAINT') {
          throw new ConflictException(
            'User with this OAuth provider ID already exists'
          )
        }
      }
      throw new BadRequestException('Failed to create OAuth user')
    }
  }

  async update(
    id: string,
    data: UpdateUserDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id)

      // If updating username, check if it's available
      if (
        data.username &&
        existingUser.username &&
        data.username !== existingUser.username
      ) {
        const existingUsername = await userRepository.findByUsername(
          data.username
        )
        if (existingUsername) {
          throw new ConflictException('Username already in use')
        }
      }

      // Update user
      const updatedUser = await userRepository.update(id, data)
      return updatedUser
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error
      }
      if (error instanceof DatabaseError) {
        // Type assertion to access the code property
        const dbError = error as IDatabaseError
        if (dbError.code === 'NOT_FOUND') {
          throw new NotFoundException(`User with ID ${id} not found`)
        }
        if (dbError.code === 'UNIQUE_CONSTRAINT') {
          throw new ConflictException('Username already in use')
        }
      }
      throw new BadRequestException('Failed to update user')
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Check if user exists
      await this.findById(id)
      await userRepository.delete(id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof DatabaseError) {
        // Type assertion to access the code property
        const dbError = error as IDatabaseError
        if (dbError.code === 'NOT_FOUND') {
          throw new NotFoundException(`User with ID ${id} not found`)
        }
      }
      throw new BadRequestException('Failed to delete user')
    }
  }
}
