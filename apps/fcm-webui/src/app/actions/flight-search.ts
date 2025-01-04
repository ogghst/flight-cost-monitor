'use server'
import axiosInstance from '@/lib/api/axiosConfig'
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
    //const session = await auth()
    //if (!session?.accessToken) {
    //  throw new Error('Authentication required')
    //}

    // Call the API endpoint with auth token
    const response = await axiosInstance.post('/flight-offers/simple', params)
    //  , {
    //  headers: {
    //    Authorization: `Bearer ${session.accessToken}`
    //  }
    //})
    return response.data
  } catch (error) {
    console.error('Simple search error:', error)
    throw error
  }
}

export async function searchFlightsAdvancedAction(
  params: FlightOffersAdvancedSearchRequest
): Promise<FlightOffersAdvancedResponse> {
  try {
    // Call the API endpoint with auth token
    const response = await axiosInstance.post('/flight-offers/advanced', params)
    return response.data
  } catch (error) {
    console.error('Advanced search error:', error)
    throw error
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
