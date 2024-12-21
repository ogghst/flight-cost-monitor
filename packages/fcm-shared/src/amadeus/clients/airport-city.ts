import {
    AirportCityByIdResponse,
    AirportCitySearchParams,
    AirportCitySearchResponse,
} from '../types/airport-city-search.js'
import { BaseClient } from './base.js'

export class AirportCityClient extends BaseClient {
    private readonly basePath = '/v1/reference-data/locations'

    /**
     * Search for airports and cities based on search criteria
     *
     * @param params Search parameters
     * @returns List of matching airports and cities
     */
    async search(
        params: AirportCitySearchParams
    ): Promise<AirportCitySearchResponse> {
        const searchParams = new URLSearchParams()

        // Required parameters
        searchParams.append('subType', params.subType.join(','))
        searchParams.append('keyword', params.keyword)

        // Optional parameters
        if (params.countryCode) {
            searchParams.append('countryCode', params.countryCode)
        }
        if (params['page[limit]']) {
            searchParams.append('page[limit]', params['page[limit]'].toString())
        }
        if (params['page[offset]']) {
            searchParams.append(
                'page[offset]',
                params['page[offset]'].toString()
            )
        }
        if (params.sort) {
            searchParams.append('sort', params.sort)
        }
        if (params.view) {
            searchParams.append('view', params.view)
        }

        return this.get<AirportCitySearchResponse>(
            `${this.basePath}?${searchParams.toString()}`
        )
    }

    /**
     * Get detailed information about a specific location by its ID
     *
     * @param locationId Location identifier
     * @returns Detailed location information
     */
    async getById(locationId: string): Promise<AirportCityByIdResponse> {
        return this.get<AirportCityByIdResponse>(
            `${this.basePath}/${locationId}`
        )
    }
}
