import * as flightOffer from '@fcm/shared/amadeus/clients/flight-offer'
import * as flightOfferAdvanced from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { FlightOffersService } from './flight-offers.service.js'

@ApiTags('Flight Offers')
@Controller('flight-offers')
export class FlightOffersController {
  constructor(private readonly flightOffersService: FlightOffersService) {}

  @Post('simple')
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
    params: flightOffer.FlightOfferSimpleSearchRequest
  ): Promise<flightOffer.FlightOfferSimpleSearchResponse> {
    return this.flightOffersService.searchFlightOffers(params)
  }

  @Post('advanced')
  @ApiOperation({
    summary: 'Advanced flight offers search',
    description:
      'Search for flight offers with advanced filtering options using the Amadeus API POST endpoint',
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
  async searchFlightOffersAdvanced(
    @Body(new ValidationPipe({ transform: true }))
    params: flightOfferAdvanced.FlightOffersAdvancedSearchRequest
  ): Promise<flightOfferAdvanced.FlightOffersAdvancedResponse> {
    return this.flightOffersService.searchFlightOffersAdvanced(params)
  }
}
