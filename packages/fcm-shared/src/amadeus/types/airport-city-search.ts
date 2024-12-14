import type { CollectionMeta, GeoCode } from './common.js';
import { Address, LocationSubType } from './location.js';


export type LocationView = 'LIGHT' | 'FULL';

export interface AirportCitySearchParams {
  keyword: string;
  subType: LocationSubType[];
  countryCode?: string;
  'page[limit]'?: number;
  'page[offset]'?: number;
  sort?: string;
  view?: LocationView;
}

export interface Analytics {
  travelers: {
    score: number;
  };
}

export interface LocationResponse {
  type: string;
  subType: LocationSubType;
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset?: string;
  iataCode?: string;
  geoCode?: GeoCode;
  address?: Address;
  analytics?: Analytics;
  relevance?: number;
}

export interface AirportCitySearchResponse {
  meta: CollectionMeta;
  data: LocationResponse[];
}

export interface AirportCityByIdResponse {
  meta: CollectionMeta;
  data: LocationResponse;
}