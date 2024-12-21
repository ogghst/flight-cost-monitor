import {
    FareType,
    TravelClass,
    TravelerType,
    ExtendedPrice,
    Tax,
    Fee,
} from './common.js'

import { FlightOffer } from './flight-offers.js'

export interface FlightSearchAdvancedCriteria {
    fareOptions?: {
        refundableFare?: boolean
        noPenaltyFare?: boolean
        noRestrictionFare?: boolean
        includedCheckedBagsOnly?: boolean
    }

    fareTypes?: FareType[]

    fareFilters?: {
        maxPrice?: string
        currency?: string
    }

    cabinClass?: TravelClass

    travelerTypes?: Record<TravelerType, number>

    departureTime?: {
        from?: string // HH:mm
        until?: string // HH:mm
    }

    returnTime?: {
        from?: string // HH:mm
        until?: string // HH:mm
    }

    carrierFilter?: {
        includedCarriers?: string[]
        excludedCarriers?: string[]
    }
}

export interface FlightSearchPrice extends ExtendedPrice {
    taxes: Tax[]
    fees: Fee[]
}

export interface FlightSearchResult {
    offers: FlightOffer[]
    totalCount: number
    bestPrices?: FlightSearchPrice[]
}
