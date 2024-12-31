import { User } from '@fcm/storage/schema'
import { ApiProperty } from '@nestjs/swagger'

// This DTO represents how user data will be returned in API responses
export class UserDto implements User {
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: string

  @ApiProperty({ description: 'User email address' })
  email: string

  @ApiProperty({ description: 'User password', required: false })
  password: string | null

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
