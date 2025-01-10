import { AuthType } from '@fcm/shared'
import { User } from '@fcm/storage'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'

// This DTO represents how user data will be returned in API responses
export class UserDto implements User {
  @ApiProperty({
    enum: AuthType,
    description: 'Authentication type for the user',
  })
  @IsEnum(AuthType)
  @IsNotEmpty()
  authType: AuthType

  @ApiProperty({ description: 'Array of refresh tokens', type: Array })
  refreshTokens: {
    id: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date
    token: string
    userId: string
    expiresAt: Date
    revoked: boolean
    family: string
    generationNumber: number
    replacedByToken?: string
  }[]
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: string

  @ApiProperty({ description: 'User email address' })
  email: string

  @ApiProperty({ description: 'User username', required: false })
  username?: string

  @ApiProperty({ description: 'User password', required: false })
  password?: string | null

  @ApiProperty({ description: 'User first name', required: false })
  firstName?: string | null

  @ApiProperty({ description: 'User last name', required: false })
  lastName?: string | null

  @ApiProperty({ description: 'Whether the user account is active' })
  active: boolean

  @ApiProperty({
    description: 'GitHub ID if user connected their GitHub account',
    required: false,
  })
  githubId?: string | null

  @ApiProperty({
    description: 'GitHub profile data in JSON format',
    required: false,
  })
  githubProfile?: string | null

  @ApiProperty({ description: 'URL to user profile image', required: false })
  image?: string | null

  @ApiProperty({ description: 'Timestamp of user creation' })
  createdAt: Date

  @ApiProperty({ description: 'Timestamp of last user update' })
  updatedAt: Date

  @ApiProperty({
    description: 'Timestamp of user deletion, if deleted',
    required: false,
  })
  deletedAt: Date | null
}

export class UserWithRelationsDto extends UserDto {
  @ApiProperty({ description: 'Array of user roles', type: Array })
  roles: string[]
}
