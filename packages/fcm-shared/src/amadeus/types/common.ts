import type { Itinerary, TravelerPricing } from '../clients/flight-offer/flight-offers-types.js'

// Shared enums
export enum TravelClass {
    ECONOMY = 'ECONOMY',
    PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
    BUSINESS = 'BUSINESS',
    FIRST = 'FIRST',
}

// Traveler and Flight Types
export type TravelerType =
    | 'ADULT'
    | 'CHILD'
    | 'SENIOR'
    | 'YOUNG'
    | 'HELD_INFANT'
    | 'SEATED_INFANT'
    | 'STUDENT'

export interface TravelerInfo {
    id: string
    travelerType: TravelerType
    associatedAdultId?: string
}

export type FlightOfferSource = 'GDS'
export type FareType = 'PUBLISHED' | 'NEGOTIATED' | 'CORPORATE'
export type FeeType = 'TICKETING' | 'FORM_OF_PAYMENT' | 'SUPPLIER'

// Error Types
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

// Location Types
export interface GeoCode {
    latitude: number
    longitude: number
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

// Flight Components
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

// Date and Time
export interface DateTimeRange {
    date: string // YYYY-MM-DD
    time?: string // HH:mm:ss
    dateWindow?: string // IxD, PxD, or MxD format
    timeWindow?: string // xH format
}

// Price Types
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

// Baggage Types
export interface BaggageAllowance {
    quantity?: number
    weight?: number
    weightUnit?: string
}

// Response Types
export interface Dictionaries {
    locations?: Record<string, {
        cityCode: string
        countryCode: string
    }>
    aircraft?: Record<string, string>
    currencies?: Record<string, string>
    carriers?: Record<string, string>
}

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

// Flight Offer Core Type
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
    price: ExtendedPrice
    pricingOptions: {
        fareType: string[]
        includedCheckedBagsOnly: boolean
    }
    validatingAirlineCodes: string[]
    travelerPricings: TravelerPricing[]
}

// Search Types
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