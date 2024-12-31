import type { UpdateUser } from '@fcm/storage/schema'
import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator'

// This DTO implements the UpdateUser type from storage while adding API-specific decorators
export class UpdateUserDto implements UpdateUser {
  @ApiProperty({
    description: 'User password - will be hashed before storage',
    required: false,
    minLength: 8,
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string

  @ApiProperty({
    description: 'User first name',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string | null

  @ApiProperty({
    description: 'User last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string | null

  @ApiProperty({
    description: 'GitHub ID if connecting GitHub account',
    required: false,
  })
  @IsString()
  @IsOptional()
  githubId?: string | null

  @ApiProperty({
    description: 'GitHub profile data in JSON format',
    required: false,
  })
  @IsString()
  @IsOptional()
  githubProfile?: string | null

  @ApiProperty({
    description: 'URL to user profile image',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  image?: string | null
}
