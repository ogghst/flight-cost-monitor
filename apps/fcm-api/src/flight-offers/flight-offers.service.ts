import { InjectLogger } from '#/logging/decorators/inject-logger.decorator.js'
import { formatError } from '#/utils/error.utils.js'
import {
    AmadeusApiError,
    ClientConfig,
    FlightOfferClient,
} from '@fcm/shared/amadeus/clients'

import type {
    FlightOfferSearchResponse,
    FlightOffersGetParams,
} from '@fcm/shared/amadeus/types'
import type { Logger } from '@fcm/shared/logging'
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosError } from 'axios'

interface AmadeusError {
    code: string
    status: number
    title?: string
    detail?: string
}

interface AmadeusErrorResponse {
    errors: AmadeusError[]
}

@Injectable()
export class FlightOffersService {
    private accessToken: string | null = null
    private tokenExpiry: Date | null = null
    private clientConfig: ClientConfig | null = null
    private flightClient: FlightOfferClient | null = null

    constructor(
        @InjectLogger() private readonly logger: Logger,
        private readonly configService: ConfigService
    ) {
        this.clientConfig = new ClientConfig({
            clientId: process.env.AMADEUS_CLIENT_ID!,
            clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
        })
        this.flightClient = new FlightOfferClient(this.clientConfig)
    }

    private get baseUrl(): string {
        return (
            this.configService.get('AMADEUS_API_URL') ||
            'https://test.api.amadeus.com/v2'
        )
    }

    private async getAccessToken(): Promise<string> {
        return this.flightClient.getAccessToken()
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

            // Check if it's an Axios error
            if (error instanceof AxiosError) {
                throw new BadRequestException({
                    message: (error as AxiosError)?.message,
                    error: (error as AxiosError)?.code,
                    status: (error as AxiosError)?.status,
                })
            }

            // Handle validation errors
            if (error instanceof Error) {
                throw new BadRequestException({
                    message: error.message || 'Invalid request parameters',
                    error: error.name,
                    status: 400,
                })
            }

            // For all other errors
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
