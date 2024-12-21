import type {
    TravelClass,
    TravelerType,
    FlightEndPoint,
    OperatingFlight,
    Aircraft as AircraftEquipment,
    ExtendedPrice as Price,
    BaggageAllowance,
    FlightOfferSource,
    Dictionaries,
    CollectionMeta,
} from './common.js'

export interface FlightStop {
    iataCode: string
    duration: string // ISO8601 format
    arrivalAt: string // ISO8601 format
    departureAt: string // ISO8601 format
}

export interface FlightSegment {
    departure: FlightEndPoint
    arrival: FlightEndPoint
    carrierCode: string
    number: string
    aircraft: AircraftEquipment
    operating?: OperatingFlight
    duration: string // ISO8601 format
    id: string
    numberOfStops: number
    stops?: FlightStop[]
    blacklistedInEU: boolean
}

export interface Itinerary {
    duration: string // ISO8601 format
    segments: FlightSegment[]
}

export interface FareDetailsBySegment {
    segmentId: string
    cabin: TravelClass
    fareBasis: string
    brandedFare?: string
    class: string
    includedCheckedBags: BaggageAllowance
}

export interface TravelerPricing {
    travelerId: string
    fareOption: string
    travelerType: TravelerType
    price: Price
    fareDetailsBySegment: FareDetailsBySegment[]
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

export interface FlightOffersGetParams {
    originLocationCode: string
    destinationLocationCode: string
    departureDate: string // YYYY-MM-DD
    returnDate?: string // YYYY-MM-DD
    adults: number
    children?: number
    infants?: number
    travelClass?: TravelClass
    includedAirlineCodes?: string[]
    excludedAirlineCodes?: string[]
    nonStop?: boolean
    currencyCode?: string
    maxPrice?: number
    max?: number
}

export interface DateTimeRange {
    date: string // YYYY-MM-DD
    time?: string // HH:mm:ss
    dateWindow?: string // IxD, PxD, or MxD format
    timeWindow?: string // xH format
}

export interface OriginDestination {
    id: string
    originLocationCode: string
    destinationLocationCode: string
    departureDateTimeRange: DateTimeRange
    arrivalDateTimeRange?: DateTimeRange
    originRadius?: number
    destinationRadius?: number
    alternativeOriginsCodes?: string[]
    alternativeDestinationsCodes?: string[]
    includedConnectionPoints?: string[]
    excludedConnectionPoints?: string[]
}

export interface TravelerInfo {
    id: string
    travelerType: TravelerType
    associatedAdultId?: string
}

export interface FlightFilters {
    crossBorderAllowed?: boolean
    moreOvernightsAllowed?: boolean
    returnToDepartureAirport?: boolean
    railSegmentAllowed?: boolean
    busSegmentAllowed?: boolean
    maxFlightTime?: number
    carrierRestrictions?: {
        blacklistedInEUAllowed?: boolean
        excludedCarrierCodes?: string[]
        includedCarrierCodes?: string[]
    }
    cabinRestrictions?: Array<{
        cabin: TravelClass
        coverage: 'MOST_SEGMENTS' | 'AT_LEAST_ONE_SEGMENT' | 'ALL_SEGMENTS'
        originDestinationIds: string[]
    }>
    connectionRestriction?: {
        maxNumberOfConnections?: number
        nonStopPreferred?: boolean
        airportChangeAllowed?: boolean
        technicalStopsAllowed?: boolean
    }
}

export interface FlightOfferSearchRequest {
    currencyCode?: string
    originDestinations: OriginDestination[]
    travelers: TravelerInfo[]
    sources: [FlightOfferSource]
    searchCriteria?: {
        maxFlightOffers?: number
        flightFilters?: FlightFilters
        additionalInformation?: {
            chargeableCheckedBags?: boolean
            brandedFares?: boolean
        }
        pricingOptions?: {
            includedCheckedBagsOnly?: boolean
            refundableFare?: boolean
            noRestrictionFare?: boolean
            noPenaltyFare?: boolean
        }
    }
}

export interface FlightOfferSearchResponse {
    data: FlightOffer[]
    meta: CollectionMeta
    dictionaries?: Dictionaries
}
