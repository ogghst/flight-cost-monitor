import { GeoCode, CollectionMeta } from './common';

export type LocationSubType =
  | 'AIRPORT'
  | 'CITY'
  | 'POINT_OF_INTEREST'
  | 'DISTRICT';
export type ViewType = 'LIGHT' | 'FULL';
export type LocationCategory =
  | 'SIGHTS'
  | 'BEACH_PARK'
  | 'HISTORICAL'
  | 'NIGHTLIFE'
  | 'RESTAURANT'
  | 'SHOPPING';

export interface Address {
  cityName: string;
  cityCode: string;
  countryName: string;
  countryCode: string;
  stateCode?: string;
  regionCode: string;
}

export interface Links {
  href: string;
  methods?: Array<'GET' | 'PUT' | 'DELETE' | 'POST' | 'PATCH'>;
  count?: number;
}

export interface Location {
  id: string;
  self: Links;
  type: string;
  subType: LocationSubType;
  name: string;
  detailedName: string;
  timeZoneOffset?: string;
  iataCode: string;
  geoCode?: GeoCode;
  address?: Address;
  relevance?: number;
  category?: LocationCategory;
  tags?: string[];
  rank?: string;
}

// Request/Response types
export interface LocationSearchParams {
  subType: LocationSubType[];
  keyword: string;
  countryCode?: string;
  'page[limit]'?: number;
  'page[offset]'?: number;
  sort?: 'analytics.travelers.score';
  view?: ViewType;
}

export interface LocationSearchResponse {
  meta?: CollectionMeta;
  data: Location[];
}

export interface LocationByIdResponse {
  meta?: CollectionMeta;
  data: Location;
}
