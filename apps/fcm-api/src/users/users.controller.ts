import { LoginOAuthDtoSwagger } from '@/auth/dto/oauth-login.dto.js'
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
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserWithCredentialsDtoSwagger } from './dto/create-user.dto.js'
import { UpdateUserDtoSwagger } from './dto/update-user.dto.js'
import { UserDtoSwagger, UserWithRelationsDtoSwagger } from './dto/user.dto.js'
import { UsersService } from './users.service.js'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('credentials')
  @ApiOperation({ summary: 'Create a new user with credentials' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserDtoSwagger,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 409,
    description: 'User with this email or username already exists.',
  })
  async createWithCredentials(
    @Body() createUserDto: CreateUserWithCredentialsDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    return await this.usersService.createWithCredentials(createUserDto)
  }

  @Post('oauth')
  @ApiOperation({ summary: 'Create or link a user with OAuth' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created or linked.',
    type: UserWithRelationsDtoSwagger,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({
    status: 409,
    description: 'OAuth user already exists or email is in use.',
  })
  async createWithOAuth(
    @Body() createUserDto: LoginOAuthDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    return await this.usersService.createWithOAuth(createUserDto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user data.',
    type: UserWithRelationsDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findById(
    @Param('id') id: string
  ): Promise<UserWithRelationsDtoSwagger> {
    return await this.usersService.findById(id)
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user data.',
    type: UserWithRelationsDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findByEmail(
    @Param('email') email: string
  ): Promise<UserWithRelationsDtoSwagger> {
    return await this.usersService.findByEmail(email)
  }

  @Get('oauth/:provider/:providerId')
  @ApiOperation({ summary: 'Get a user by OAuth provider and ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user data if found.',
    type: UserWithRelationsDtoSwagger,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findByOAuth(
    @Param('provider') provider: string,
    @Param('providerId') providerId: string
  ): Promise<UserWithRelationsDtoSwagger> {
    const user = await this.usersService.findByOAuth(provider, providerId)
    if (!user) {
      return null
    }
    return user
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: UserWithRelationsDtoSwagger,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDtoSwagger
  ): Promise<UserWithRelationsDtoSwagger> {
    return await this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id)
  }
}
