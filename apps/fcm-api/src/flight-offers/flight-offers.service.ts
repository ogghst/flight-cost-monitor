import { InjectLogger } from '#/logging/decorators/inject-logger.decorator.js'
import { formatError } from '#/utils/error.utils.js'
import { ClientConfig, FlightOfferClient } from '@fcm/fcm-shared'
import type { FlightOfferSearchResponse } from '@fcm/fcm-shared/amadeus/types'
import type { Logger } from '@fcm/fcm-shared/logging'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SearchFlightOffersDto } from './dto/search-flight-offers.dto.js'

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
        params: SearchFlightOffersDto
    ): Promise<FlightOfferSearchResponse> {
        try {
            this.logger.info('Starting flight offers search', {
                origin: params.originLocationCode,
                destination: params.destinationLocationCode,
                departureDate: params.departureDate,
                returnDate: params.returnDate,
                adults: params.adults,
                travelClass: params.travelClass,
            })

            const response = await this.flightClient.getOffers({
                originLocationCode: params.originLocationCode,
                destinationLocationCode: params.destinationLocationCode,
                departureDate: params.departureDate,
                returnDate: params.returnDate,
                adults: params.adults,
                travelClass: params.travelClass,
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
        }
    }
}
