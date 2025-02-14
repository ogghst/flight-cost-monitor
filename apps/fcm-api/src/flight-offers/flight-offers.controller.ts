import { type AuthUser } from '@fcm/shared'
import * as flightOffer from '@fcm/shared/amadeus/clients/flight-offer'
import * as flightOfferAdvanced from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import {
  type FlightOffersAdvancedSearchRequest,
  FlightOfferSearchDto,
  type FlightOfferSearchParams,
} from '@fcm/shared/flight-offer-search'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CurrentUser } from '../auth/decorators/user.decorator.js'
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js'
import { FlightOfferSimpleSearchRequestDto } from './dto/search-flight-offers.dto.js'
import { FlightOffersService } from './flight-offers.service.js'

@ApiTags('Flight Offers')
@Controller('flight-offers')
@ApiBearerAuth('access-token')
export class FlightOffersController {
  constructor(private readonly flightOffersService: FlightOffersService) {}

  @Post('simple')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Search flight offers',
    description:
      'Search for flight offers based on specified criteria using the Amadeus API',
  })
  @ApiBody({
    type: FlightOfferSimpleSearchRequestDto,
    examples: {
      basic: {
        value: {
          originLocationCode: 'MXP',
          destinationLocationCode: 'JFK',
          departureDate: '2025-06-01',
          adults: 1,
          travelClass: 'ECONOMY',
        },
      },
    },
  })
  @ApiQuery({
    name: 'savedSearchId',
    required: false,
    type: String,
    description: 'ID of a saved search to track search history',
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
    params: FlightOfferSimpleSearchRequestDto,
    @CurrentUser('id') user: AuthUser,
    @Query('savedSearchId') savedSearchId?: string
  ): Promise<flightOffer.FlightOfferSimpleSearchResponse> {
    return this.flightOffersService.searchFlightOffers(
      params,
      user.email,
      savedSearchId
    )
  }

  @Post('advanced')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Advanced flight offers search',
    description:
      'Search for flight offers with advanced filtering options using the Amadeus API POST endpoint',
  })
  @ApiBody({
    type: Object,
    schema: {
      example: {
        originDestinations: [
          {
            id: '1',
            originLocationCode: 'MXP',
            destinationLocationCode: 'JFK',
            departureDateTimeRange: {
              date: '2025-06-01',
              time: '10:00:00',
            },
          },
        ],
        travelers: [
          {
            id: '1',
            travelerType: 'ADULT',
            fareOptions: ['STANDARD'],
          },
        ],
        sources: ['GDS'],
        searchCriteria: {
          maxFlightOffers: 50,
          flightFilters: {
            cabinRestrictions: [
              {
                cabin: 'ECONOMY',
                coverage: 'MOST_SEGMENTS',
                originDestinationIds: ['1'],
              },
            ],
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'savedSearchId',
    required: false,
    type: String,
    description: 'ID of a saved search to track search history',
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
    params: FlightOffersAdvancedSearchRequest,
    @CurrentUser('id') user: AuthUser,
    @Query('savedSearchId') savedSearchId?: string
  ): Promise<flightOfferAdvanced.FlightOffersAdvancedResponse> {
    return this.flightOffersService.searchFlightOffersAdvanced(
      params,
      user.email,
      savedSearchId
    )
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user search history',
    description:
      'Retrieve flight offer search history for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Search history successfully retrieved',
  })
  async getUserSearchHistory(
    @CurrentUser('id') user: AuthUser,
    @Query(new ValidationPipe({ transform: true }))
    params?: FlightOfferSearchParams
  ): Promise<FlightOfferSearchDto[]> {
    return this.flightOffersService.getUserSearchHistory(user.email, params)
  }

  @Get('search/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get search by ID',
    description: 'Retrieve a specific flight offer search by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the search to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Search successfully retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Search not found',
  })
  async getSearchById(
    @Param('id') id: string
  ): Promise<FlightOfferSearchDto | null> {
    return this.flightOffersService.getSearchById(id)
  }

  @Get('usersearch/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get search by User Search ID',
    description: 'Retrieve all results by User Search ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the user search to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Search successfully retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'Search not found',
  })
  async getSearchByUserSearchId(
    @Param('id') id: string
  ): Promise<FlightOfferSearchDto[]> {
    return this.flightOffersService.getSearchByUserSearchId(id)
  }

  @Delete('search/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete search',
    description: 'Soft delete a flight offer search',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the search to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Search successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Search not found',
  })
  async deleteSearch(@Param('id') id: string): Promise<void> {
    await this.flightOffersService.deleteSearch(id)
  }
}
