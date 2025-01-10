import { AuthType, AuthUser, OAuthProvider } from '@fcm/shared/auth'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'

export class AuthUserDto implements AuthUser {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  username?: string | null

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  firstName?: string | null

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  lastName?: string | null

  @ApiProperty({
    description: 'User roles',
    example: ['USER', 'ADMIN'],
    isArray: true,
  })
  roles: string[]

  @ApiProperty({
    description: 'Authentication type',
    enum: AuthType,
    example: AuthType.CREDENTIAL,
  })
  @IsEnum(AuthType)
  authType: AuthType

  @ApiProperty({
    description: 'Authentication provider',
    enum: OAuthProvider,
    example: OAuthProvider.GITHUB,
  })
  @IsOptional()
  @IsEnum(OAuthProvider)
  oauthProvider?: OAuthProvider

  @ApiProperty({
    description: 'User profile',
  })
  @IsString()
  @IsOptional()
  profile?: string

  @ApiProperty({
    description: 'User image',
  })
  @IsString()
  @IsOptional()
  image?: string
}
