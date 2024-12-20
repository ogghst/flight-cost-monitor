import { FlightOfferSearchResponse } from '@fcm/fcm-shared/amadeus/types'
import { Controller, Get, Query, ValidationPipe } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { SearchFlightOffersDto } from './dto/search-flight-offers.dto.js'
import { FlightOffersService } from './flight-offers.service.js'

@ApiTags('Flight Offers')
@Controller('flight-offers')
export class FlightOffersController {
    constructor(private readonly flightOffersService: FlightOffersService) {}

    @Get()
    @ApiOperation({
        summary: 'Search flight offers',
        description:
            'Search for flight offers based on specified criteria using the Amadeus API',
    })
    @ApiResponse({
        status: 200,
        description: 'Flight offers successfully retrieved',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid search parameters provided',
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid API credentials',
    })
    @ApiResponse({
        status: 429,
        description: 'Too many requests - API rate limit exceeded',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error or Amadeus API error',
    })
    async searchFlightOffers(
        @Query(new ValidationPipe({ transform: true }))
        params: SearchFlightOffersDto
    ): Promise<FlightOfferSearchResponse> {
        return this.flightOffersService.searchFlightOffers(params)
    }
}
