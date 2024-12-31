import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsJSON, IsOptional, IsString } from 'class-validator'
import type { CreateUserSearch } from '@fcm/storage/schema'

export class CreateUserSearchDto implements CreateUserSearch {
  @ApiProperty({ 
    description: 'ID of the user creating the search' 
  })
  @IsString()
  userId: string

  @ApiProperty({ 
    description: 'Type of search (SIMPLE or ADVANCED)',
    example: 'SIMPLE'
  })
  @IsString()
  searchType: string

  @ApiProperty({ 
    description: 'Search criteria in JSON format',
    example: '{"origin": "MXP", "destination": "JFK", "date": "2025-01-01"}'
  })
  @IsJSON()
  criteria: string

  @ApiProperty({ 
    description: 'Optional user-given name for the search',
    required: false,
    example: 'Milan to New York, Jan 2025'
  })
  @IsString()
  @IsOptional()
  title?: string | null

  @ApiProperty({ 
    description: 'Whether to mark this search as favorite',
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  favorite: boolean = false

  @ApiProperty({ 
    description: 'When this search was last used',
    default: 'Current timestamp' 
  })
  lastUsed: Date = new Date()
}