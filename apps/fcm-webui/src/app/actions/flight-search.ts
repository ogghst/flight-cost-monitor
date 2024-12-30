'use server'
import type {
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'
import { FlightOfferClient } from '@fcm/shared/amadeus/clients/flight-offer'
import type {
  FlightOffersAdvancedResponse,
  FlightOffersAdvancedSearchRequest,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { FlightOfferAdvancedClient } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { amadeusConfig } from '../../lib/config/amadeus'

const flightClients = {
  simple: new FlightOfferClient(amadeusConfig),
  advanced: new FlightOfferAdvancedClient(amadeusConfig),
}

export async function searchFlightsAction(
  params: FlightOfferSimpleSearchRequest
): Promise<FlightOfferSimpleSearchResponse> {
  try {
    return await flightClients.simple.searchFlightOffers(params)
  } catch (error) {
    console.error('Simple search error:', error)
    throw new Error('Failed to search flights')
  }
}

export async function searchFlightsAdvancedAction(
  params: FlightOffersAdvancedSearchRequest
): Promise<FlightOffersAdvancedResponse> {
  try {
    return await flightClients.advanced.searchFlightOffersAdvanced(params)
  } catch (error) {
    console.error('Advanced search error:', error)
    throw new Error('Failed to search flights')
  }
}
