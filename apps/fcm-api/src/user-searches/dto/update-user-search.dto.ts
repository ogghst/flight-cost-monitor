import type { UpdateUserSearchDto as SharedDto } from '@fcm/shared/user-search/types'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsJSON, IsOptional, IsString } from 'class-validator'

export class UpdateUserSearchDto implements SharedDto {
  @ApiProperty({
    description: 'ID of the user search to update',
    required: true,
  })
  @IsString()
  id: string

  @ApiProperty({
    description: 'New search parameters in JSON format',
    required: false,
    example: '{"origin": "MXP", "destination": "JFK", "date": "2025-01-01"}',
  })
  @IsJSON()
  parameters: string

  @ApiProperty({
    description: 'New name for the search',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string | null

  @ApiProperty({
    description: 'Whether to mark this search as favorite',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  favorite?: boolean
}
