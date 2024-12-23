import {
    FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
    TravelClass,
} from '@fcm/shared/amadeus/types'
import dayjs, { type Dayjs } from 'dayjs'
import { z } from 'zod'

export const searchFlightSchema = z.object({
    originLocationCode: z
        .string()
        .length(3, 'Must be exactly 3 characters')
        .transform((val) => val.toUpperCase()),
    destinationLocationCode: z
        .string()
        .length(3, 'Must be exactly 3 characters')
        .transform((val) => val.toUpperCase()),
    departureDate: z
        .custom<Dayjs>()
        .refine((date) => date?.isValid(), 'Invalid date')
        .refine(
            (date) => date?.isAfter(new Date()),
            'Date must be in the future'
        ),
    returnDate: z
        .custom<Dayjs>()
        .refine((date) => date?.isValid(), 'Invalid date')
        .refine(
            (date) => date?.isAfter(new Date()),
            'Date must be in the future'
        ),
    adults: z
        .number()
        .min(1, 'At least 1 adult required')
        .max(9, 'Maximum 9 adults allowed'),
    children: z
        .number()
        .min(0, 'Cannot be negative')
        .max(9, 'Maximum 9 children allowed')
        .default(0),
    infants: z
        .number()
        .min(0, 'Cannot be negative')
        .max(9, 'Maximum 9 infants allowed')
        .default(0),
    travelClass: z.nativeEnum(TravelClass),
    nonStop: z.boolean().default(false),
    currencyCode: z
        .string()
        .length(3, 'Must be exactly 3 characters')
        .transform((val) => val.toUpperCase())
        .default('EUR'),
    maxResults: z
        .number()
        .min(1, 'Must request at least 1 result')
        .max(250, 'Maximum 250 results allowed')
        .default(50),
})

export type FlightSearchFormValues = z.infer<typeof searchFlightSchema>

export const initialValues: FlightSearchFormValues = {
    ...FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
    originLocationCode:
        FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.originLocationCode ?? '',
    destinationLocationCode:
        FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.destinationLocationCode ?? '',
    departureDate: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.departureDate
        ? dayjs(FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.departureDate)
        : dayjs(),
    returnDate: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.returnDate
        ? dayjs(FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.returnDate)
        : dayjs(),
    adults: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.adults ?? 1,
    children: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.children ?? 0,
    infants: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.infants ?? 0,
    travelClass:
        FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.travelClass ?? TravelClass.ECONOMY,
    nonStop: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.nonStop ?? false,
    currencyCode: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.currencyCode ?? 'EUR',
    maxResults: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES.maxResults ?? 50,
}
