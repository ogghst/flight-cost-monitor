import { InjectLogger } from '#/logging/decorators/inject-logger.decorator.js'
import { formatError } from '#/utils/error.utils.js'
import { AmadeusApiError, ClientConfig } from '@fcm/shared/amadeus/clients'
import {
    FlightOfferClient,
    FlightOfferSearchResponse,
    FlightOffersGetParams,
} from '@fcm/shared/amadeus/clients/flight-offer'
import {
    FlightOfferAdvancedClient,
    FlightOffersAdvancedResponse,
    FlightOffersAdvancedSearchRequest,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'

import type { Logger } from '@fcm/shared/logging'
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
        })
        this.flightClient = new FlightOfferClient(this.clientConfig)
        this.flightAdvancedClient = new FlightOfferAdvancedClient(
            this.clientConfig
        )
    }

    async searchFlightOffers(
        params: FlightOffersGetParams
    ): Promise<FlightOfferSearchResponse> {
        try {
            this.logger.info('Starting flight offers search', {
                params,
            })

            const response = await this.flightClient.getOffers({
                ...params,
            })

            this.logger.info('Flight offers search completed', {
                count: response.data.length,
            })

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
                error:
                    error instanceof Error
                        ? error.message
                        : 'INTERNAL_SERVER_ERROR',
                status: 500,
            })
        }
    }

    async searchFlightOffersAdvanced(
        params: FlightOffersAdvancedSearchRequest
    ): Promise<FlightOffersAdvancedResponse> {
        try {
            this.logger.info('Starting advanced flight offers search', {
                params,
            })

            const response =
                await this.flightAdvancedClient.searchFlightOffersAdvanced(
                    params
                )

            this.logger.info('Advanced flight offers search completed', {
                count: response.meta.count,
            })

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
                error:
                    error instanceof Error
                        ? error.message
                        : 'INTERNAL_SERVER_ERROR',
                status: 500,
            })
        }
    }
}
