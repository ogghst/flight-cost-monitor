import { BaseClient } from '../base.js'
import {
  FlightOffersAdvancedResponse,
  FlightOffersAdvancedSearchRequest,
} from './flight-offers-advanced-types.js'

export class FlightOfferAdvancedClient extends BaseClient {
  /**
   * Search flight offers using advanced POST endpoint with more filtering options.
   * @param request Advanced search request with detailed criteria
   */
  async searchFlightOffersAdvanced(
    request: FlightOffersAdvancedSearchRequest
  ): Promise<FlightOffersAdvancedResponse> {
    const headers = {
      'Content-Type': 'application/json',
    }

    return this.post(this.baseUrl, request, { headers })
  }
}
