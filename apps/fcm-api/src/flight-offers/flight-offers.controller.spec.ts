import {
    FlightOffersAdvancedResponse,
    FlightOffersAdvancedSearchRequest,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'

import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { FlightOffersController } from './flight-offers.controller.js'
import { FlightOffersService } from './flight-offers.service.js'

describe('FlightOffersController', () => {
    let controller: FlightOffersController
    let service: FlightOffersService

    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FlightOffersController],
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

        controller = module.get<FlightOffersController>(FlightOffersController)
        service = module.get<FlightOffersService>(FlightOffersService)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })

    describe('searchFlightOffersAdvanced', () => {
        it('should call service.searchFlightOffersAdvanced with correct parameters', async () => {
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
                searchCriteria: {
                    maxFlightOffers: 50,
                },
            }

            const mockResponse: FlightOffersAdvancedResponse = {
                meta: { count: 1 },
                data: [
                    {
                        type: 'flight-offer' as const,
                        id: '1',
                        source: 'GDS',
                        instantTicketingRequired: false,
                        nonHomogeneous: false,
                        oneWay: false,
                        lastTicketingDate: '2024-12-24',
                        numberOfBookableSeats: 4,
                        itineraries: [],
                        price: {
                            currency: 'EUR',
                            total: '100.00',
                            base: '90.00',
                        },
                        pricingOptions: {
                            fareType: ['PUBLISHED'],
                            includedCheckedBagsOnly: true,
                        },
                        validatingAirlineCodes: ['AF'],
                        travelerPricings: [],
                    },
                ],
                dictionaries: {
                    locations: {},
                    aircraft: {},
                    currencies: {},
                    carriers: {},
                },
            }

            jest.spyOn(service, 'searchFlightOffersAdvanced').mockResolvedValue(
                mockResponse
            )

            const result =
                await controller.searchFlightOffersAdvanced(mockRequest)

            expect(service.searchFlightOffersAdvanced).toHaveBeenCalledWith(
                mockRequest
            )
            expect(result).toBe(mockResponse)
        })

        it('should handle errors properly', async () => {
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

            const mockError = new Error('Test error')
            jest.spyOn(service, 'searchFlightOffersAdvanced').mockRejectedValue(
                mockError
            )

            await expect(
                controller.searchFlightOffersAdvanced(mockRequest)
            ).rejects.toThrow('Test error')
        })
    })
})
