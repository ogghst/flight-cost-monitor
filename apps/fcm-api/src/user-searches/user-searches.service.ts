import { SearchType } from '@fcm/shared'
import { userSearchRepository } from '@fcm/storage/repositories'
import { DatabaseError } from '@fcm/storage/schema'
import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserSearchDto } from './dto/create-user-search.dto.js'
import { UpdateUserSearchDto } from './dto/update-user-search.dto.js'
import { UserSearchDto } from './dto/user-search.dto.js'

@Injectable()
export class UserSearchesService {
  async create(
    createUserSearchDto: CreateUserSearchDto
  ): Promise<UserSearchDto> {
    try {
      return await userSearchRepository.create(createUserSearchDto)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new Error('Failed to create user search')
      }
      throw error
    }
  }

  async findById(id: string): Promise<UserSearchDto> {
    const search = await userSearchRepository.findById(id)
    if (!search) {
      throw new NotFoundException(`Search with ID ${id} not found`)
    }
    return search
  }

  async findByUserEmail(
    userEmail: string,
    searchType?: SearchType
  ): Promise<UserSearchDto[]> {
    try {
      return await userSearchRepository.findByUserEmail(userEmail, searchType)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new Error('Failed to fetch user searches')
      }
      throw error
    }
  }

  async findFavorites(userEmail: string): Promise<UserSearchDto[]> {
    try {
      return await userSearchRepository.findFavorites(userEmail)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new Error('Failed to fetch favorite searches')
      }
      throw error
    }
  }

  async update(
    id: string,
    updateUserSearchDto: UpdateUserSearchDto
  ): Promise<UserSearchDto> {
    try {
      return await userSearchRepository.update(id, updateUserSearchDto)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new NotFoundException(`Search with ID ${id} not found`)
      }
      throw error
    }
  }

  async updateLastUsed(id: string): Promise<UserSearchDto> {
    try {
      return await userSearchRepository.updateLastUsed(id)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new NotFoundException(`Search with ID ${id} not found`)
      }
      throw error
    }
  }

  async toggleFavorite(id: string): Promise<UserSearchDto> {
    try {
      return await userSearchRepository.toggleFavorite(id)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new NotFoundException(`Search with ID ${id} not found`)
      }
      throw error
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await userSearchRepository.softDelete(id)
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw new NotFoundException(`Search with ID ${id} not found`)
      }
      throw error
    }
  }
}
