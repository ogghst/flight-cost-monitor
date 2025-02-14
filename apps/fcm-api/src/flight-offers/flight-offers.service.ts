import { InjectLogger } from '@/logging/decorators/inject-logger.decorator.js'
import { formatError } from '@/utils/error.utils.js'
import { SearchType } from '@fcm/shared'
import { AmadeusApiError, ClientConfig } from '@fcm/shared/amadeus/clients'
import {
  FlightOfferClient,
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'
import {
  FlightOfferAdvancedClient,
  FlightOffersAdvancedResponse,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import {
  CreateFlightOfferSearchDto,
  FlightOffersAdvancedSearchRequest,
  FlightOfferSearchDto,
  FlightOfferSearchParams,
} from '@fcm/shared/flight-offer-search'

import type { Logger } from '@fcm/shared/logging'
import { flightOfferSearchRepository } from '@fcm/storage/repositories'
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosError } from 'axios'

@Injectable()
export class FlightOffersService {
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null
  private clientConfig: ClientConfig | null = null
  private flightClient: FlightOfferClient | null = null
  private flightAdvancedClient: FlightOfferAdvancedClient | null = null

  constructor(
    @InjectLogger() private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {
    this.clientConfig = new ClientConfig({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
      baseUrl: process.env.AMADEUS_FLIGHT_OFFER_API_URL!,
      authUrl: process.env.AMADEUS_AUTH_URL!,
      timeout: parseInt(process.env.AMADEUS_TIMEOUT!) || 60000,
    })

    this.flightClient = new FlightOfferClient(this.clientConfig)
    this.flightAdvancedClient = new FlightOfferAdvancedClient(this.clientConfig)

    this.logger.debug('Initialized Amadeus clients', {
      baseUrl: process.env.AMADEUS_FLIGHT_OFFER_API_URL,
      authUrl: process.env.AMADEUS_AUTH_URL,
      timeout: process.env.AMADEUS_TIMEOUT,
    })
  }

  private async storeSearchResults(
    userEmail: string,
    searchType: SearchType,
    parameters:
      | FlightOfferSimpleSearchRequest
      | FlightOffersAdvancedSearchRequest,
    response: FlightOfferSimpleSearchResponse | FlightOffersAdvancedResponse,
    savedSearchId?: string
  ): Promise<FlightOfferSearchDto> {
    try {
      const createDto: CreateFlightOfferSearchDto = {
        searchType,
        parameters,
        savedSearchId,
        status: 'COMPLETED',
        totalResults: response.data.length,
        results: response.data.map((offer) => ({
          id: undefined, // This will be set by the database
          searchId: undefined, // This will be set by the database
          offerId: offer.id,
          price: parseFloat(offer.price.total),
          validatingCarrier: offer.validatingAirlineCodes[0],
          segments: offer.itineraries[0].segments,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        userEmail,
      }

      return await flightOfferSearchRepository.create(createDto)
    } catch (error) {
      this.logger.error('Failed to store search results', formatError(error))
      throw new InternalServerErrorException('Failed to store search results')
    }
  }

  async searchFlightOffers(
    params: FlightOfferSimpleSearchRequest,
    userEmail: string,
    savedSearchId?: string
  ): Promise<FlightOfferSimpleSearchResponse> {
    try {
      this.logger.info('Starting flight offers search', {
        params,
        userEmail,
      })

      const response = await this.flightClient.searchFlightOffers(params)

      this.logger.info('Flight offers search completed', {
        count: response.data.length,
      })

      // Store search results
      await this.storeSearchResults(
        userEmail,
        SearchType.SIMPLE,
        params,
        response,
        savedSearchId
      )

      return response
    } catch (error) {
      this.logger.error(
        'Failed to send flight offers search request',
        formatError(error)
      )

      if (error instanceof AmadeusApiError) {
        throw new BadRequestException({
          message: error.message,
          error: error.name,
          status: 400,
        })
      }

      if (error instanceof AxiosError) {
        throw new BadRequestException({
          message: (error as AxiosError)?.message,
          error: (error as AxiosError)?.code,
          status: (error as AxiosError)?.status,
        })
      }

      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message || 'Invalid request parameters',
          error: error.name,
          status: 400,
        })
      }

      throw new InternalServerErrorException({
        message: 'An error occurred while processing your request',
        error: error instanceof Error ? error.message : 'INTERNAL_SERVER_ERROR',
        status: 500,
      })
    }
  }

  async getSearchByUserSearchId(id: string): Promise<FlightOfferSearchDto[]> {
    try {
      return await flightOfferSearchRepository.findByUserSearchId(id)
    } catch (error) {
      this.logger.error(
        'Failed to retrieve search by User Search ID',
        formatError(error)
      )
      throw new InternalServerErrorException('Failed to retrieve search')
    }
  }

  async searchFlightOffersAdvanced(
    params: FlightOffersAdvancedSearchRequest,
    userEmail: string,
    savedSearchId?: string
  ): Promise<FlightOffersAdvancedResponse> {
    try {
      this.logger.info('Starting advanced flight offers search', {
        params,
        userEmail,
      })

      const response =
        await this.flightAdvancedClient.searchFlightOffersAdvanced(params)

      this.logger.info('Advanced flight offers search completed', {
        count: response.meta.count,
      })

      // Store search results
      await this.storeSearchResults(
        userEmail,
        SearchType.ADVANCED,
        params,
        response,
        savedSearchId
      )

      return response
    } catch (error) {
      this.logger.error(
        'Failed to send advanced flight offers search request',
        formatError(error)
      )

      if (error instanceof AmadeusApiError) {
        throw new BadRequestException({
          message: error.message,
          error: error.name,
          status: 400,
        })
      }

      if (error instanceof AxiosError) {
        throw new BadRequestException({
          message: (error as AxiosError)?.message,
          error: (error as AxiosError)?.code,
          status: (error as AxiosError)?.status,
        })
      }

      if (error instanceof Error) {
        throw new BadRequestException({
          message: error.message || 'Invalid request parameters',
          error: error.name,
          status: 400,
        })
      }

      throw new InternalServerErrorException({
        message: 'An error occurred while processing your request',
        error: error instanceof Error ? error.message : 'INTERNAL_SERVER_ERROR',
        status: 500,
      })
    }
  }

  async getUserSearchHistory(
    userEmail: string,
    params?: FlightOfferSearchParams
  ): Promise<FlightOfferSearchDto[]> {
    try {
      return await flightOfferSearchRepository.findByUserEmail(
        userEmail,
        params
      )
    } catch (error) {
      this.logger.error(
        'Failed to retrieve user search history',
        formatError(error)
      )
      throw new InternalServerErrorException(
        'Failed to retrieve search history'
      )
    }
  }

  async getSearchById(id: string): Promise<FlightOfferSearchDto | null> {
    try {
      return await flightOfferSearchRepository.findById(id)
    } catch (error) {
      this.logger.error('Failed to retrieve search by ID', formatError(error))
      throw new InternalServerErrorException('Failed to retrieve search')
    }
  }

  async deleteSearch(id: string): Promise<void> {
    try {
      await flightOfferSearchRepository.softDelete(id)
    } catch (error) {
      this.logger.error('Failed to delete search', formatError(error))
      throw new InternalServerErrorException('Failed to delete search')
    }
  }
}
