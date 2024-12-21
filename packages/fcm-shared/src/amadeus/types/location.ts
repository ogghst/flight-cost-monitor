import { GeoCode, CollectionMeta } from './common.js'

export interface Address {
    cityCode?: string
    cityName?: string
    countryName?: string
    countryCode: string
    regionCode?: string
    stateCode?: string
}

export interface Location {
    id: string
    name: string
    address: Address
    geoCode: GeoCode
    timeZoneOffset: string
}

export interface GetLocationResponse {
    data: Location
    meta: CollectionMeta
}

export interface SearchLocationsResponse {
    data: Location[]
    meta: CollectionMeta
}

export type SearchLocationType =
    | 'AIRPORT'
    | 'CITY'
    | 'POINT_OF_INTEREST'
    | 'DISTRICT'

export interface SearchLocationsParams {
    keyword: string
    subType?: SearchLocationType[]
    countryCode?: string
    sort?: string
    view?: 'FULL' | 'LIGHT'
    page?: {
        limit?: number
        offset?: number
    }
}
