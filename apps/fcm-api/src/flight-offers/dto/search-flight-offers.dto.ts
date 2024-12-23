import { FlightOffersGetParams, TravelClass } from '@fcm/shared/amadeus/types'
import { ApiProperty } from '@nestjs/swagger'
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Length,
    Max,
    Min,
} from 'class-validator'

export class SearchFlightOffersDto implements FlightOffersGetParams {
    @ApiProperty({ example: 'LHR', description: 'Origin airport IATA code' })
    @IsString()
    @Length(3, 3)
    originLocationCode: string

    @ApiProperty({
        example: 'JFK',
        description: 'Destination airport IATA code',
    })
    @IsString()
    @Length(3, 3)
    destinationLocationCode: string

    @ApiProperty({
        example: '2024-03-25',
        description: 'Departure date (YYYY-MM-DD)',
    })
    @IsString()
    departureDate: string

    @ApiProperty({
        example: '2024-03-25',
        description: 'Return date (YYYY-MM-DD)',
    })
    @IsString()
    returnDate: string

    @ApiProperty({ example: 1, description: 'Number of adult passengers' })
    @IsInt()
    @Min(1)
    @Max(9)
    adults: number

    @ApiProperty({
        example: 0,
        description: 'Number of child passengers (2-11 years)',
    })
    @IsInt()
    @Min(0)
    @Max(9)
    @IsOptional()
    children?: number

    @ApiProperty({
        example: 0,
        description: 'Number of infant passengers (0-2 years)',
    })
    @IsInt()
    @Min(0)
    @Max(9)
    @IsOptional()
    infants?: number

    @ApiProperty({ enum: TravelClass, example: TravelClass.ECONOMY })
    @IsEnum(TravelClass)
    travelClass: TravelClass

    @ApiProperty({
        example: ['LH', 'AF'],
        description: 'Only show flights from these airlines',
    })
    @IsArray()
    @IsOptional()
    includedAirlineCodes?: string[]

    @ApiProperty({
        example: ['FR', 'W6'],
        description: 'Exclude flights from these airlines',
    })
    @IsArray()
    @IsOptional()
    excludedAirlineCodes?: string[]

    @ApiProperty({ example: false, description: 'Only show non-stop flights' })
    @IsBoolean()
    @IsOptional()
    nonStop?: boolean

    @ApiProperty({ example: 2000, description: 'Maximum price per passenger' })
    @IsInt()
    @Min(0)
    @IsOptional()
    maxPrice?: number

    @ApiProperty({ example: 'EUR', description: 'Currency code (ISO 4217)' })
    @IsString()
    @Length(3, 3)
    @IsOptional()
    currencyCode?: string

    @ApiProperty({ example: 50, description: 'Maximum number of results' })
    @IsInt()
    @Min(1)
    @Max(250)
    @IsOptional()
    max?: number
}
