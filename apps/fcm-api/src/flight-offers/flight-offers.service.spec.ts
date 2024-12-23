import { AmadeusApiError } from '@fcm/shared/amadeus/clients'
import { FlightOffersAdvancedSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import {
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosError } from 'axios'
import { FlightOffersService } from './flight-offers.service.js'

jest.mock('@fcm/shared/amadeus/clients', () => {
    return {
        ClientConfig: jest.fn().mockImplementation(() => ({})),
        FlightOfferClient: jest.fn().mockImplementation(() => ({
            getAccessToken: jest.fn().mockResolvedValue('test-token'),
            getOffers: jest.fn(),
        })),
        FlightOfferAdvancedClient: jest.fn().mockImplementation(() => ({
            searchFlightOffersAdvanced: jest.fn(),
        })),
        AmadeusApiError: class MockAmadeusApiError extends Error {
            constructor(message: string) {
                super(message)
                this.name = 'AmadeusApiError'
            }
        },
    }
})

describe('FlightOffersService', () => {
    let service: FlightOffersService
    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }

    beforeEach(async () => {
        process.env.AMADEUS_CLIENT_ID = 'test-client-id'
        process.env.AMADEUS_CLIENT_SECRET = 'test-client-secret'

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FlightOffersService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-value'),
                    },
                },
                {
                    provide: 'Logger',
                    useValue: mockLogger,
                },
            ],
        }).compile()

        service = module.get<FlightOffersService>(FlightOffersService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('searchFlightOffersAdvanced', () => {
        const mockRequest: FlightOffersAdvancedSearchRequest = {
            currencyCode: 'EUR',
            originDestinations: [
                {
                    id: '1',
                    originLocationCode: 'PAR',
                    destinationLocationCode: 'NYC',
                    departureDateTimeRange: {
                        date: '2024-12-25',
                    },
                },
            ],
            travelers: [
                {
                    id: '1',
                    travelerType: 'ADULT',
                },
            ],
            sources: ['GDS'],
        }

        it('should successfully search for advanced flight offers', async () => {
            const mockResponse = {
                meta: { count: 1 },
                data: [
                    {
                        /* mock flight offer data */
                    },
                ],
                dictionaries: {
                    /* mock dictionaries */
                },
            }

            // @ts-expect-error - accessing private property for testing
            service.flightAdvancedClient.searchFlightOffersAdvanced = jest
                .fn()
                .mockResolvedValue(mockResponse)

            const result = await service.searchFlightOffersAdvanced(mockRequest)

            expect(result).toBe(mockResponse)
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Starting advanced flight offers search',
                { params: mockRequest }
            )
            expect(mockLogger.info).toHaveBeenCalledWith(
                'Advanced flight offers search completed',
                { count: 1 }
            )
        })

        it('should handle AmadeusApiError', async () => {
            // @ts-expect-error - accessing private property for testing
            service.flightAdvancedClient.searchFlightOffersAdvanced = jest
                .fn()
                .mockRejectedValue(new AmadeusApiError('Amadeus API Error'))

            await expect(
                service.searchFlightOffersAdvanced(mockRequest)
            ).rejects.toThrow(BadRequestException)
            expect(mockLogger.error).toHaveBeenCalled()
        })

        it('should handle AxiosError', async () => {
            const axiosError = new AxiosError('Network Error', 'NETWORK_ERROR')

            // @ts-expect-error - accessing private property for testing
            service.flightAdvancedClient.searchFlightOffersAdvanced = jest
                .fn()
                .mockRejectedValue(axiosError)

            await expect(
                service.searchFlightOffersAdvanced(mockRequest)
            ).rejects.toThrow(BadRequestException)
            expect(mockLogger.error).toHaveBeenCalled()
        })

        it('should handle general errors', async () => {
            // @ts-expect-error - accessing private property for testing
            service.flightAdvancedClient.searchFlightOffersAdvanced = jest
                .fn()
                .mockRejectedValue(new Error('General Error'))

            await expect(
                service.searchFlightOffersAdvanced(mockRequest)
            ).rejects.toThrow(BadRequestException)
            expect(mockLogger.error).toHaveBeenCalled()
        })

        it('should handle unknown errors', async () => {
            // @ts-expect-error - accessing private property for testing
            service.flightAdvancedClient.searchFlightOffersAdvanced = jest
                .fn()
                .mockRejectedValue('Unknown Error')

            await expect(
                service.searchFlightOffersAdvanced(mockRequest)
            ).rejects.toThrow(InternalServerErrorException)
            expect(mockLogger.error).toHaveBeenCalled()
        })
    })
})
