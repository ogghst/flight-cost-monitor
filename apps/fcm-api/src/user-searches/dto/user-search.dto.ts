import { SearchType } from '@fcm/shared'
import { FlightOfferAdvancedSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { FlightOfferSimpleSearchRequest } from '@fcm/shared/flight-offer-search'
import type { UserSearchDto as SharedDto } from '@fcm/shared/user-search/types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsEmail, IsEnum, IsOptional } from 'class-validator'

// This DTO represents how user search data will be returned in API responses
export class UserSearchDto implements SharedDto {
  @ApiProperty({ description: 'Unique identifier of the search' })
  id: string

  @ApiProperty({ description: 'ID of the user who created the search' })
  @IsEmail()
  userEmail: string

  @ApiProperty({ description: 'Type of search (SIMPLE or ADVANCED)' })
  @IsEnum(SearchType, {
    message: 'searchType must be a valid SearchType enum value',
  })
  searchType: string

  @ApiProperty({ description: 'Search parameters in JSON format' })
  parameters: FlightOfferSimpleSearchRequest | FlightOfferAdvancedSearchRequest

  @ApiProperty({
    description: 'Optional user-given name for the search',
    required: false,
  })
  name?: string | null

  @ApiProperty({ description: 'Whether this search is marked as favorite' })
  favorite: boolean

  @ApiProperty({ description: 'When this search was last used' })
  @IsOptional()
  @IsDate()
  lastUsed?: Date

  @ApiProperty({ description: 'When the search was created' })
  createdAt: Date

  @ApiProperty({ description: 'When the search was last updated' })
  updatedAt: Date
}
