import { SearchType } from '@fcm/shared/auth'
import type { CreateUserSearchDto as SharedDto } from '@fcm/shared/user-search/types'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsJSON, IsOptional, IsString } from 'class-validator'

export class CreateUserSearchDto implements SharedDto {
  searchType: SearchType
  @ApiProperty({
    description: 'Email of the user creating the search',
  })
  @IsString()
  userEmail: string
  /*
  @ApiProperty({
    description: 'Type of search (SIMPLE or ADVANCED)',
    example: 'SIMPLE',
  })
  searchType: SearchType
*/
  @ApiProperty({
    description: 'Search criteria in JSON format',
    example: '{"origin": "MXP", "destination": "JFK", "date": "2025-01-01"}',
  })
  @IsJSON()
  parameters: string

  @ApiProperty({
    description: 'Optional user-given name for the search',
    required: false,
    example: 'Milan to New York, Jan 2025',
  })
  @IsString()
  @IsOptional()
  name?: string | null

  @ApiProperty({
    description: 'Whether to mark this search as favorite',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  favorite: boolean = false
}
