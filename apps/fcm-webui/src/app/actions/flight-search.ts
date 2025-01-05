'use server'

import { makeServerRequest } from '@/lib/api/axiosConfig'
import { amadeusConfig } from '@/lib/config/amadeus'
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

// Keep the local clients for fallback/testing purposes
const flightClients = {
  simple: new FlightOfferClient(amadeusConfig),
  advanced: new FlightOfferAdvancedClient(amadeusConfig),
}

export async function searchFlightsAction(
  params: FlightOfferSimpleSearchRequest
): Promise<FlightOfferSimpleSearchResponse> {
  try {
    return await makeServerRequest<FlightOfferSimpleSearchResponse>(
      'POST',
      '/flight-offers/simple',
      JSON.stringify(params)
    )
  } catch (error) {
    console.error('Simple search error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to search flights: ${error.message}`)
    }
    throw new Error('Failed to search flights')
  }
}

export async function searchFlightsAdvancedAction(
  params: FlightOffersAdvancedSearchRequest
): Promise<FlightOffersAdvancedResponse> {
  try {
    return await makeServerRequest<FlightOffersAdvancedResponse>(
      'POST',
      '/flight-offers/advanced',
      JSON.stringify(params)
    )
  } catch (error) {
    console.error('Advanced search error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to search flights: ${error.message}`)
    }
    throw new Error('Failed to search flights')
  }
}

// Keep the local actions for fallback/testing purposes
export async function searchFlightsActionLocal(
  params: FlightOfferSimpleSearchRequest
): Promise<FlightOfferSimpleSearchResponse> {
  try {
    return await flightClients.simple.searchFlightOffers(params)
  } catch (error) {
    console.error('Simple search error:', error)
    throw new Error('Failed to search flights')
  }
}

export async function searchFlightsAdvancedActionLocal(
  params: FlightOffersAdvancedSearchRequest
): Promise<FlightOffersAdvancedResponse> {
  try {
    return await flightClients.advanced.searchFlightOffersAdvanced(params)
  } catch (error) {
    console.error('Advanced search error:', error)
    throw new Error('Failed to search flights')
  }
}
