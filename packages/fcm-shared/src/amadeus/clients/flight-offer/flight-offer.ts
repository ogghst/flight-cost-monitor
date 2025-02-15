import { BaseClient } from '../base.js'
import type {
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from './flight-offers-types.js'

export class FlightOfferClient extends BaseClient {
  /**
   * Get flight offers using simplified parameters (GET endpoint)
   *
   * @param params Simple search parameters for flight offers
   * @returns List of matching flight offers
   */
  async searchFlightOffers(
    params: FlightOfferSimpleSearchRequest
  ): Promise<FlightOfferSimpleSearchResponse> {
    const searchParams = new URLSearchParams()

    // Add required parameters
    searchParams.append('originLocationCode', params.originLocationCode)
    searchParams.append(
      'destinationLocationCode',
      params.destinationLocationCode
    )
    searchParams.append('departureDate', params.departureDate)
    searchParams.append('adults', params.adults.toString())

    // Add optional parameters
    if (params.returnDate) {
      searchParams.append('returnDate', params.returnDate)
    }
    if (params.children !== undefined) {
      searchParams.append('children', params.children.toString())
    }
    if (params.infants !== undefined) {
      searchParams.append('infants', params.infants.toString())
    }
    if (params.travelClass) {
      searchParams.append('travelClass', params.travelClass)
    }
    if (params.includedAirlineCodes) {
      searchParams.append(
        'includedAirlineCodes',
        params.includedAirlineCodes.join(',')
      )
    }
    if (params.excludedAirlineCodes) {
      searchParams.append(
        'excludedAirlineCodes',
        params.excludedAirlineCodes.join(',')
      )
    }
    if (params.nonStop !== undefined) {
      searchParams.append('nonStop', params.nonStop.toString())
    }
    if (params.currencyCode) {
      searchParams.append('currencyCode', params.currencyCode)
    }
    if (params.maxPrice !== undefined) {
      searchParams.append('maxPrice', params.maxPrice.toString())
    }
    if (params.maxResults !== undefined) {
      searchParams.append('max', params.maxResults.toString())
    }

    return this.get<FlightOfferSimpleSearchResponse>(
      `${this.baseUrl}?${searchParams.toString()}`
    )
  }

  /**
   * Helper method to format a flight offer's duration
   * @param duration Duration string in ISO8601 format
   * @returns Formatted duration string (e.g., "2h 30m")
   */
  static formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?/)
    if (!match) return duration

    const hours = match[1] ? parseInt(match[1]) : 0
    const minutes = match[2] ? parseInt(match[2]) : 0

    return `${hours ? hours + 'h' : ''}${minutes ? ' ' + minutes + 'm' : ''}`.trim()
  }

  /**
   * Helper method to format a price
   * @param price Price string
   * @param currency Currency code
   * @returns Formatted price string (e.g., "$123.45")
   */
  static formatPrice(price: string, currency: string): string {
    const numPrice = parseFloat(price)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(numPrice)
  }
}
