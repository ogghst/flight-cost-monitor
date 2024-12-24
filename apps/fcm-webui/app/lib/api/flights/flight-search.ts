'use server'
import { FlightOfferSearchResponse, FlightOffersGetParams } from '@fcm/shared/amadeus/clients/flight-offer'
import type { FlightOffersAdvancedResponse, FlightOffersAdvancedSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { axiosInstance } from '../axiosConfig'

// Set timeout to 60 seconds
axiosInstance.defaults.timeout = 60000

export const searchFlights = async (params: FlightOffersGetParams): Promise<FlightOfferSearchResponse> => {
  const { data } = await axiosInstance.post<FlightOfferSearchResponse>('/flight-offers/simple', params)
  console.log('searchFlights response: \n', JSON.stringify(data, null, 2))
  return data
}

export const searchFlightsAdvanced = async (params: FlightOffersAdvancedSearchRequest): Promise<FlightOffersAdvancedResponse> => {
  const { data } = await axiosInstance.post<FlightOffersAdvancedResponse>('/flight-offers/advanced', params)
  console.log('searchFlightsAdvanced response: \n', JSON.stringify(data, null, 2))
  return data
}
