import { TravelClass } from '@fcm/shared/amadeus/types'
import { z } from 'zod'

// Type mapping for advanced search
const dateTimeRangeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z
    .string()
    .transform((val) => (val.length === 0 ? undefined : val))
    .optional(),
  dateWindow: z
    .string()
    .transform((val) => (val.length === 0 ? undefined : val))
    .optional(),
  timeWindow: z
    .string()
    .transform((val) => (val.length === 0 ? undefined : val))
    .optional(),
})

const originDestinationSchema = z.object({
  id: z.string(),
  originLocationCode: z.string().length(3, 'Airport code must be exactly 3 characters'),
  destinationLocationCode: z.string().length(3, 'Airport code must be exactly 3 characters'),
  departureDateTimeRange: dateTimeRangeSchema.optional(),
  arrivalDateTimeRange: dateTimeRangeSchema.optional(),
  originRadius: z.number().min(0).max(300).optional(),
  destinationRadius: z.number().min(0).max(300).optional(),
  alternativeOriginsCodes: z.array(z.string()).max(2).optional(),
  alternativeDestinationsCodes: z.array(z.string()).max(2).optional(),
  includedConnectionPoints: z.array(z.string()).max(2).optional(),
  excludedConnectionPoints: z.array(z.string()).max(3).optional(),
})

const travelerSchema = z.object({
  id: z.string(),
  travelerType: z.enum(['ADULT', 'CHILD', 'SENIOR', 'YOUNG', 'HELD_INFANT', 'SEATED_INFANT', 'STUDENT']),
  associatedAdultId: z.string().optional(),
})

const cabinRestrictionSchema = z.object({
  cabin: z.nativeEnum(TravelClass),
  coverage: z.enum(['MOST_SEGMENTS', 'AT_LEAST_ONE_SEGMENT', 'ALL_SEGMENTS']).optional(),
  originDestinationIds: z.array(z.string()).optional(),
})

const searchCriteriaSchema = z.object({
  excludeAllotments: z.boolean().optional(),
  addOneWayOffers: z.boolean().optional(),
  maxFlightOffers: z.number().min(1).max(250).optional(),
  maxPrice: z.number().positive().optional(),
  allowAlternativeFareOptions: z.boolean().optional(),
  oneFlightOfferPerDay: z.boolean().optional(),
  additionalInformation: z
    .object({
      chargeableCheckedBags: z.boolean().optional(),
      brandedFares: z.boolean().optional(),
    })
    .optional(),
  pricingOptions: z
    .object({
      includedCheckedBagsOnly: z.boolean().optional(),
      refundableFare: z.boolean().optional(),
      noRestrictionFare: z.boolean().optional(),
      noPenaltyFare: z.boolean().optional(),
    })
    .optional(),
  flightFilters: z
    .object({
      crossBorderAllowed: z.boolean().optional(),
      moreOvernightsAllowed: z.boolean().optional(),
      returnToDepartureAirport: z.boolean().optional(),
      railSegmentAllowed: z.boolean().optional(),
      busSegmentAllowed: z.boolean().optional(),
      maxFlightTime: z.number().optional(),
      carrierRestrictions: z
        .object({
          blacklistedInEUAllowed: z.boolean().optional(),
          excludedCarrierCodes: z
            .array(z.string())
            .max(99)
            .optional()
            .transform((val) => (val?.length === 0 ? null : val)),
          includedCarrierCodes: z
            .array(z.string())
            .max(99)
            .optional()
            .transform((val) => (val?.length === 0 ? null : val)),
        })
        .optional(),
      cabinRestrictions: z.array(cabinRestrictionSchema).max(6).optional(),
      connectionRestriction: z
        .object({
          maxNumberOfConnections: z.number().min(0).max(2).optional(),
          nonStopPreferred: z.boolean().optional(),
          airportChangeAllowed: z.boolean().optional(),
          technicalStopsAllowed: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
})

export const flightSearchAdvancedSchema = z.object({
  currencyCode: z.string().length(3, 'Currency code must be exactly 3 characters').optional(),
  originDestinations: z.array(originDestinationSchema).min(1).max(6),
  travelers: z.array(travelerSchema).min(1).max(9),
  sources: z.array(z.literal('GDS')),
  searchCriteria: searchCriteriaSchema.optional(),
})
