import {
    Itinerary,
    TravelerPricing,
} from '../clients/flight-offer/flight-offers-types.js'
import { ExtendedPrice as Price } from './common.js'

// Shared enums
export enum TravelClass {
    ECONOMY = 'ECONOMY',
    PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
    BUSINESS = 'BUSINESS',
    FIRST = 'FIRST',
}

export type TravelerType =
    | 'ADULT'
    | 'CHILD'
    | 'SENIOR'
    | 'YOUNG'
    | 'HELD_INFANT'
    | 'SEATED_INFANT'
    | 'STUDENT'
export type FlightOfferSource = 'GDS'
export type FareType = 'PUBLISHED' | 'NEGOTIATED' | 'CORPORATE'
export type FeeType = 'TICKETING' | 'FORM_OF_PAYMENT' | 'SUPPLIER'

// Error handling types
export interface ErrorSource {
    pointer?: string
    parameter?: string
    example?: string
}

export interface ApiError {
    status: number
    code: number
    title: string
    detail?: string
    source?: ErrorSource
}

export interface ErrorResponse {
    errors: ApiError[]
}

// Basic location info
export interface GeoCode {
    latitude: number
    longitude: number
}

// Common structures for flights
export interface FlightEndPoint {
    iataCode: string
    terminal?: string
    at: string // ISO8601 format
}

export interface Aircraft {
    code: string // IATA aircraft code
}

export interface OperatingFlight {
    carrierCode: string
}

// Price related types
export interface Fee {
    amount: string
    type: FeeType
}

export interface Tax {
    amount: string
    code: string
}

export interface BasePrice {
    currency: string
    total: string
    base: string
    fees?: Fee[]
    taxes?: Tax[]
}

export interface ExtendedPrice extends BasePrice {
    grandTotal: string
    billingCurrency?: string
    margin?: string
    refundableTaxes?: string
}

// Baggage related types
export interface BaggageAllowance {
    quantity?: number
    weight?: number
    weightUnit?: string
}

// Dictionary types
export interface Dictionaries {
    locations?: Record<
        string,
        {
            cityCode: string
            countryCode: string
        }
    >
    aircraft?: Record<string, string>
    currencies?: Record<string, string>
    carriers?: Record<string, string>
}

// Common collection metadata
export interface CollectionMeta {
    count?: number
    links?: {
        self?: string
        next?: string
        previous?: string
        last?: string
        first?: string
        up?: string
    }
}

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
export interface FlightOffer {
    type: 'flight-offer'
    id: string
    source: FlightOfferSource
    instantTicketingRequired: boolean
    nonHomogeneous: boolean
    oneWay: boolean
    lastTicketingDate: string // YYYY-MM-DD
    lastTicketingDateTime?: string // ISO8601
    numberOfBookableSeats: number
    itineraries: Itinerary[]
    price: Price
    pricingOptions: {
        fareType: string[]
        includedCheckedBagsOnly: boolean
    }
    validatingAirlineCodes: string[]
    travelerPricings: TravelerPricing[]
}
