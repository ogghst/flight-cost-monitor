import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsJSON, IsOptional, IsString } from 'class-validator'
import type { UpdateUserSearch } from '@fcm/storage/schema'

export class UpdateUserSearchDto implements UpdateUserSearch {
  @ApiProperty({ 
    description: 'New search criteria in JSON format',
    required: false,
    example: '{"origin": "MXP", "destination": "JFK", "date": "2025-01-01"}'
  })
  @IsJSON()
  @IsOptional()
  criteria?: string

  @ApiProperty({ 
    description: 'New name for the search',
    required: false 
  })
  @IsString()
  @IsOptional()
  title?: string | null

  @ApiProperty({ 
    description: 'Whether to mark this search as favorite',
    required: false 
  })
  @IsBoolean()
  @IsOptional()
  favorite?: boolean
}