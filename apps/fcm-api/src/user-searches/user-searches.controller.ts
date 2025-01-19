import { SearchType } from '@fcm/shared/user-search'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserSearchDtoSwagger } from './dto/create-user-search.dto.js'
import { UpdateUserSearchDtoSwagger } from './dto/update-user-search.dto.js'
import { UserSearchDtoSwagger } from './dto/user-search.dto.js'
import { UserSearchesService } from './user-searches.service.js'

@ApiTags('User Searches')
@Controller('user-searches')
export class UserSearchesController {
  constructor(private readonly userSearchesService: UserSearchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user search' })
  @ApiResponse({
    status: 201,
    description: 'The search has been successfully created.',
    type: UserSearchDtoSwagger,
  })
  async create(
    @Body() createUserSearchDto: CreateUserSearchDtoSwagger
  ): Promise<UserSearchDtoSwagger> {
    return await this.userSearchesService.create(createUserSearchDto)
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all searches for a user' })
  @ApiQuery({
    name: 'searchType',
    required: false,
    description: 'Filter by search type (SIMPLE or ADVANCED)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of user searches.',
    type: [UserSearchDtoSwagger],
  })
  async findByUserEmail(
    @Param('userId') userId: string,
    @Query('searchType') searchType?: SearchType
  ): Promise<UserSearchDtoSwagger[]> {
    const type = searchType as SearchType
    return await this.userSearchesService.findByUserEmail(userId, type)
  }

  @Get('user/:userId/favorites')
  @ApiOperation({ summary: 'Get favorite searches for a user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of favorite searches.',
    type: [UserSearchDtoSwagger],
  })
  async findFavorites(
    @Param('userEmail') userEmail: string
  ): Promise<UserSearchDtoSwagger[]> {
    return await this.userSearchesService.findFavorites(userEmail)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a search by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the search data.',
    type: UserSearchDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async findOne(@Param('id') id: string): Promise<UserSearchDtoSwagger> {
    return await this.userSearchesService.findById(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a search' })
  @ApiResponse({
    status: 200,
    description: 'The search has been successfully updated.',
    type: UserSearchDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserSearchDto: UpdateUserSearchDtoSwagger
  ): Promise<UserSearchDtoSwagger> {
    return await this.userSearchesService.update(id, updateUserSearchDto)
  }

  @Post(':id/used')
  @ApiOperation({ summary: 'Update last used timestamp of a search' })
  @ApiResponse({
    status: 200,
    description: 'The search timestamp has been updated.',
    type: UserSearchDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async updateLastUsed(@Param('id') id: string): Promise<UserSearchDtoSwagger> {
    return await this.userSearchesService.updateLastUsed(id)
  }

  @Post(':id/toggle-favorite')
  @ApiOperation({ summary: 'Toggle favorite status of a search' })
  @ApiResponse({
    status: 200,
    description: 'The favorite status has been toggled.',
    type: UserSearchDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async toggleFavorite(@Param('id') id: string): Promise<UserSearchDtoSwagger> {
    return await this.userSearchesService.toggleFavorite(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a search' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'The search has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.userSearchesService.remove(id)
  }
}
