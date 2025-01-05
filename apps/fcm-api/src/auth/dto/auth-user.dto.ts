import { AuthType, AuthUser, OAuthProvider } from '@fcm/shared/auth'
import { ApiProperty } from '@nestjs/swagger'

export class AuthUserDto implements AuthUser {
  @ApiProperty({
    description: 'User ID',
    example: 'cl8f9x3u50000qw2j8zk1q2j5',
  })
  id: string

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    required: false,
    nullable: true,
  })
  username?: string | null

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
    nullable: true,
  })
  firstName?: string | null

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    required: false,
    nullable: true,
  })
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
  authType: AuthType

  @ApiProperty({
    description: 'Authentication provider',
    enum: OAuthProvider,
    example: OAuthProvider.GITHUB,
  })
  oauthProvider: OAuthProvider

  @ApiProperty({
    description: 'User profile',
  })
  profile: string

  @ApiProperty({
    description: 'User image',
  })
  image: string
}
