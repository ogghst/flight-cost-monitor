import { SearchType } from '@fcm/shared'
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
import { CreateUserSearchDto } from './dto/create-user-search.dto.js'
import { UpdateUserSearchDto } from './dto/update-user-search.dto.js'
import { UserSearchDto } from './dto/user-search.dto.js'
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
    type: UserSearchDto,
  })
  async create(
    @Body() createUserSearchDto: CreateUserSearchDto
  ): Promise<UserSearchDto> {
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
    type: [UserSearchDto],
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query('searchType') searchType?: string
  ): Promise<UserSearchDto[]> {
    const type = searchType as SearchType
    return await this.userSearchesService.findByUser(userId, type)
  }

  @Get('user/:userId/favorites')
  @ApiOperation({ summary: 'Get favorite searches for a user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of favorite searches.',
    type: [UserSearchDto],
  })
  async findFavorites(
    @Param('userId') userId: string
  ): Promise<UserSearchDto[]> {
    return await this.userSearchesService.findFavorites(userId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a search by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the search data.',
    type: UserSearchDto,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async findOne(@Param('id') id: string): Promise<UserSearchDto> {
    return await this.userSearchesService.findById(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a search' })
  @ApiResponse({
    status: 200,
    description: 'The search has been successfully updated.',
    type: UserSearchDto,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserSearchDto: UpdateUserSearchDto
  ): Promise<UserSearchDto> {
    return await this.userSearchesService.update(id, updateUserSearchDto)
  }

  @Post(':id/used')
  @ApiOperation({ summary: 'Update last used timestamp of a search' })
  @ApiResponse({
    status: 200,
    description: 'The search timestamp has been updated.',
    type: UserSearchDto,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async updateLastUsed(@Param('id') id: string): Promise<UserSearchDto> {
    return await this.userSearchesService.updateLastUsed(id)
  }

  @Post(':id/toggle-favorite')
  @ApiOperation({ summary: 'Toggle favorite status of a search' })
  @ApiResponse({
    status: 200,
    description: 'The favorite status has been toggled.',
    type: UserSearchDto,
  })
  @ApiResponse({ status: 404, description: 'Search not found.' })
  async toggleFavorite(@Param('id') id: string): Promise<UserSearchDto> {
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
