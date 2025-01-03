import type { UserSearch } from '@fcm/storage/schema'
import { ApiProperty } from '@nestjs/swagger'

// This DTO represents how user search data will be returned in API responses
export class UserSearchDto implements UserSearch {
  @ApiProperty({ description: 'Unique identifier of the search' })
  id: string

  @ApiProperty({ description: 'ID of the user who created the search' })
  userId: string

  @ApiProperty({ description: 'Type of search (SIMPLE or ADVANCED)' })
  searchType: string

  @ApiProperty({ description: 'Search parameters in JSON format' })
  parameters: string

  @ApiProperty({
    description: 'Optional user-given name for the search',
    required: false,
  })
  name?: string | null

  @ApiProperty({ description: 'Whether this search is marked as favorite' })
  favorite: boolean

  @ApiProperty({ description: 'When this search was last used' })
  lastUsed: Date

  @ApiProperty({ description: 'When the search was created' })
  createdAt: Date

  @ApiProperty({ description: 'When the search was last updated' })
  updatedAt: Date

  @ApiProperty({
    description: 'When the search was deleted, if applicable',
    required: false,
  })
  deletedAt: Date | null
}
