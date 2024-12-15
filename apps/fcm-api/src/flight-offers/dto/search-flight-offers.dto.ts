import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TravelClass } from '@fcm/shared/amadeus/types';

export class SearchFlightOffersDto {
  @ApiProperty({
    description: 'IATA code of the origin city/airport',
    example: 'JFK',
  })
  @IsString()
  originLocationCode: string;

  @ApiProperty({
    description: 'IATA code of the destination city/airport',
    example: 'LHR',
  })
  @IsString()
  destinationLocationCode: string;

  @ApiProperty({
    description: 'Departure date (YYYY-MM-DD)',
    example: '2024-12-25',
  })
  @IsString()
  departureDate: string;

  @ApiPropertyOptional({
    description: 'Return date for round trips (YYYY-MM-DD)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  returnDate?: string;

  @ApiProperty({
    description: 'Number of adult passengers',
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  adults: number;

  @ApiPropertyOptional({
    description: 'Number of child passengers (2-11 years)',
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  children?: number;

  @ApiPropertyOptional({
    description: 'Number of infant passengers (under 2 years)',
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  infants?: number;

  @ApiPropertyOptional({
    description: 'Desired cabin class for the flight',
    enum: TravelClass,
    example: TravelClass.ECONOMY,
  })
  @IsOptional()
  @IsEnum(TravelClass)
  travelClass?: TravelClass;

  @ApiPropertyOptional({
    description: 'List of airline codes to include in search',
    type: [String],
    example: ['BA', 'AA'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedAirlineCodes?: string[];

  @ApiPropertyOptional({
    description: 'List of airline codes to exclude from search',
    type: [String],
    example: ['FR', 'U2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedAirlineCodes?: string[];

  @ApiPropertyOptional({
    description: 'Search for non-stop flights only',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  nonStop?: boolean;

  @ApiPropertyOptional({
    description: 'Currency code for pricing',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiPropertyOptional({
    description: 'Maximum price in the specified currency',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of offers to return',
    minimum: 1,
    maximum: 250,
    default: 50,
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(250)
  @Type(() => Number)
  max?: number;
}
