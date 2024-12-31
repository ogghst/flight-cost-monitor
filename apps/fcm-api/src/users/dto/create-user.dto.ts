import type { CreateUser } from '@fcm/storage/schema'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator'

// This DTO implements the CreateUser type from storage while adding API-specific decorators
export class CreateUserDto implements CreateUser {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Whether the user is active',
  })
  @IsBoolean()
  @IsNotEmpty()
  active: boolean

  @ApiProperty({
    description: 'User password - will be hashed before storage',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string

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
    description: 'GitHub ID if registering with GitHub',
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
