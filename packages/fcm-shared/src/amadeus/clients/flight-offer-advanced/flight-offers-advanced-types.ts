import { Dictionaries, FlightOffer } from 'src/amadeus/types/common.js'
import { TravelClass } from '../../types/common.js'

export type FlightOfferSource = 'GDS'

export interface DateTimeRange {
  date: string // YYYY-MM-DD
  time?: string // HH:mm:ss
  dateWindow?: string // I3D, P3D, M3D format
  timeWindow?: string // 1-12H format
}

export interface OriginDestination {
  id: string
  originLocationCode: string
  destinationLocationCode: string
  departureDateTimeRange?: DateTimeRange
  arrivalDateTimeRange?: DateTimeRange
  originRadius?: number // max 300km
  destinationRadius?: number // max 300km
  alternativeOriginsCodes?: string[] // max 2
  alternativeDestinationsCodes?: string[] // max 2
  includedConnectionPoints?: string[] // max 2
  excludedConnectionPoints?: string[] // max 3
}

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
  associatedAdultId?: string // required if type is HELD_INFANT
}

export interface CabinRestriction {
  cabin: TravelClass
  coverage?: 'MOST_SEGMENTS' | 'AT_LEAST_ONE_SEGMENT' | 'ALL_SEGMENTS'
  originDestinationIds?: string[]
}

export interface CarrierRestrictions {
  blacklistedInEUAllowed?: boolean
  excludedCarrierCodes?: string[] // max 99
  includedCarrierCodes?: string[] // max 99
}

export interface ConnectionRestriction {
  maxNumberOfConnections?: number // 0, 1, or 2
  nonStopPreferred?: boolean
  airportChangeAllowed?: boolean
  technicalStopsAllowed?: boolean
}

export interface FlightFilters {
  crossBorderAllowed?: boolean
  moreOvernightsAllowed?: boolean
  returnToDepartureAirport?: boolean
  railSegmentAllowed?: boolean
  busSegmentAllowed?: boolean
  maxFlightTime?: number // percentage relative to shortest flight time
  carrierRestrictions?: CarrierRestrictions
  cabinRestrictions?: CabinRestriction[] // max 6
  connectionRestriction?: ConnectionRestriction
}

export interface PricingOptions {
  includedCheckedBagsOnly?: boolean
  refundableFare?: boolean
  noRestrictionFare?: boolean
  noPenaltyFare?: boolean
}

export interface SearchCriteria {
  excludeAllotments?: boolean
  addOneWayOffers?: boolean
  maxFlightOffers?: number // max 250
  maxPrice?: number
  allowAlternativeFareOptions?: boolean
  oneFlightOfferPerDay?: boolean
  additionalInformation?: {
    chargeableCheckedBags?: boolean
    brandedFares?: boolean
  }
  pricingOptions?: PricingOptions
  flightFilters?: FlightFilters
}

export interface FlightOfferAdvancedSearchRequest {
  currencyCode?: string
  originDestinations: OriginDestination[] // max 6
  travelers: TravelerInfo[] // max 9 adults/children, max 1 infant per adult
  sources: FlightOfferSource[]
  searchCriteria?: SearchCriteria
}

export interface LocationValue {
  cityCode: string
  countryCode: string
}

/*
export interface Dictionaries {
    locations: { [key: string]: LocationValue }
    aircraft: { [key: string]: string }
    currencies: { [key: string]: string }
    carriers: { [key: string]: string }
}
*/

export interface FlightOffersMetadata {
  count: number
  oneWayCombinations?: Array<{
    originDestinationId: string
    flightOfferIds: string[]
  }>
}

export interface FlightOffersAdvancedResponse {
  meta: FlightOffersMetadata
  data: Array<FlightOffer>
  dictionaries: Dictionaries
  warnings?: Array<{
    status: number
    code: number
    title: string
    detail?: string
    source?: {
      pointer?: string
      parameter?: string
      example?: string
    }
  }>
}

export const FLIGHT_OFFERS_DEFAULT_ADVANCED_VALUES: FlightOfferAdvancedSearchRequest =
  {
    currencyCode: 'EUR',
    originDestinations: [
      {
        id: '1',
        originLocationCode: 'MXP',
        destinationLocationCode: 'MIA',
        departureDateTimeRange: {
          date: '2025-01-25',
          time: undefined,
          dateWindow: undefined,
          timeWindow: undefined,
        },
        originRadius: undefined,
        destinationRadius: undefined,
        alternativeOriginsCodes: [],
        alternativeDestinationsCodes: [],
        includedConnectionPoints: [],
        excludedConnectionPoints: [],
      },
      {
        id: '2',
        originLocationCode: 'MIA',
        destinationLocationCode: 'MXP',
        departureDateTimeRange: {
          date: '2025-02-04',
          time: undefined,
          dateWindow: undefined,
          timeWindow: undefined,
        },
        originRadius: undefined,
        destinationRadius: undefined,
        alternativeOriginsCodes: [],
        alternativeDestinationsCodes: [],
        includedConnectionPoints: [],
        excludedConnectionPoints: [],
      },
    ],
    travelers: [
      {
        id: '1',
        travelerType: 'ADULT',
        associatedAdultId: undefined,
      },
    ],
    sources: ['GDS'],
    searchCriteria: {
      excludeAllotments: false,
      addOneWayOffers: false,
      maxFlightOffers: 10,
      maxPrice: 2000,
    },
  }
