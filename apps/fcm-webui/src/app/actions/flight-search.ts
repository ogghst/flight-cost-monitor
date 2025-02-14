'use server'

import { makeServerRequest } from '@/lib/api/axiosConfig'
import { auth } from '@/lib/auth'
import { amadeusConfig } from '@/lib/config/amadeus'
import type {
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'
import { FlightOfferClient } from '@fcm/shared/amadeus/clients/flight-offer'
import type {
  FlightOfferAdvancedSearchRequest,
  FlightOffersAdvancedResponse,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { FlightOfferAdvancedClient } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { type FlightOfferSearchDto } from '@fcm/shared/flight-offer-search'
// Keep the local clients for fallback/testing purposes
const flightClients = {
  simple: new FlightOfferClient(amadeusConfig),
  advanced: new FlightOfferAdvancedClient(amadeusConfig),
}

export async function searchFlightsAction(
  params: FlightOfferSimpleSearchRequest,
  savedSearchId?: string
): Promise<FlightOfferSimpleSearchResponse> {
  try {
    return await makeServerRequest<FlightOfferSimpleSearchResponse>(
      'POST',
      '/flight-offers/simple',
      JSON.stringify(params),
      { savedSearchId }
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
  params: FlightOfferAdvancedSearchRequest
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
  params: FlightOfferAdvancedSearchRequest
): Promise<FlightOffersAdvancedResponse> {
  try {
    return await flightClients.advanced.searchFlightOffersAdvanced(params)
  } catch (error) {
    console.error('Advanced search error:', error)
    throw new Error('Failed to search flights')
  }
}

export async function getUserSearchById(
  id: string
): Promise<FlightOfferSearchDto[]> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  try {
    const searches = await makeServerRequest<FlightOfferSearchDto[]>(
      'GET',
      `/flight-offers/usersearch/${id}`
    )

    return searches
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch user searches by id: ${error.message}`)
    }
    throw new Error('Failed to fetch user searches')
  }
}
