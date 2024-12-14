import {
  CollectionMeta,
  Dictionaries,
  FlightOfferSource,
  TravelClass,
  TravelerType,
} from './common';

import { FlightOffer } from './flight-offers';

// Shared enums

export type Coverage =
  | 'MOST_SEGMENTS'
  | 'AT_LEAST_ONE_SEGMENT'
  | 'ALL_SEGMENTS';

// Date and Time related interfaces
export interface DateTimeType {
  date: string; // ISO 8601 format (YYYY-MM-DD)
  time?: string; // HH:mm:ss format
}

export interface DateTimeRange extends DateTimeType {
  dateWindow?: string; // 'IxD', 'PxD', or 'MxD' format
  timeWindow?: string; // '1H' to '12H' format
}

// Search criteria interfaces
export interface OriginDestinationBase {
  id: string;
  originLocationCode: string; // IATA code
  destinationLocationCode: string; // IATA code
  includedConnectionPoints?: string[];
  excludedConnectionPoints?: string[];
}

export interface OriginDestination extends OriginDestinationBase {
  originRadius?: number;
  alternativeOriginsCodes?: string[];
  destinationRadius?: number;
  alternativeDestinationsCodes?: string[];
  departureDateTimeRange?: DateTimeRange;
  arrivalDateTimeRange?: DateTimeRange;
}

export interface SearchCriteria {
  excludeAllotments?: boolean;
  addOneWayOffers?: boolean;
  maxFlightOffers?: number;
  maxPrice?: number;
  allowAlternativeFareOptions?: boolean;
  oneFlightOfferPerDay?: boolean;
  additionalInformation?: {
    chargeableCheckedBags?: boolean;
    brandedFares?: boolean;
  };
  pricingOptions?: {
    includedCheckedBagsOnly?: boolean;
    refundableFare?: boolean;
    noRestrictionFare?: boolean;
    noPenaltyFare?: boolean;
  };
  flightFilters?: FlightFilters;
}

export interface FlightFilters {
  crossBorderAllowed?: boolean;
  moreOvernightsAllowed?: boolean;
  returnToDepartureAirport?: boolean;
  railSegmentAllowed?: boolean;
  busSegmentAllowed?: boolean;
  maxFlightTime?: number;
  carrierRestrictions?: CarrierRestrictions;
  cabinRestrictions?: ExtendedCabinRestriction[];
  connectionRestriction?: ConnectionRestriction;
}

export interface CarrierRestrictions {
  blacklistedInEUAllowed?: boolean;
  excludedCarrierCodes?: string[];
  includedCarrierCodes?: string[];
}

export interface CabinRestriction {
  cabin: TravelClass;
  originDestinationIds?: string[];
}

export interface ExtendedCabinRestriction extends CabinRestriction {
  coverage?: Coverage;
}

export interface ConnectionRestriction {
  maxNumberOfConnections?: number;
  nonStopPreferred?: boolean;
  airportChangeAllowed?: boolean;
  technicalStopsAllowed?: boolean;
}

// Request interfaces
export interface FlightOfferSearchRequest {
  currencyCode?: string;
  originDestinations: OriginDestination[];
  travelers: Array<{
    id: string;
    travelerType: TravelerType;
    associatedAdultId?: string;
  }>;
  sources: FlightOfferSource[];
  searchCriteria?: SearchCriteria;
}

// Simplified GET request parameters
export interface FlightOffersGetParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: TravelClass;
  includedAirlineCodes?: string[];
  excludedAirlineCodes?: string[];
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
}

// Response interfaces
export interface FlightOfferSearchResponse {
  meta?: CollectionMeta;
  data: FlightOffer[];
  dictionaries?: Dictionaries;
}
