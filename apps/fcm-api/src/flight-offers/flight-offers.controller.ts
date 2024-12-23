import {
    FlightOfferSearchResponse,
    type FlightOffersGetParams,
} from '@fcm/shared/amadeus/types'
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FlightOffersService } from './flight-offers.service.js'

@ApiTags('Flight Offers')
@Controller('flight-offers')
export class FlightOffersController {
    constructor(private readonly flightOffersService: FlightOffersService) {}

    @Post()
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
        @Body(new ValidationPipe({ transform: true }))
        params: FlightOffersGetParams
    ): Promise<FlightOfferSearchResponse> {
        return this.flightOffersService.searchFlightOffers(params)
    }
}