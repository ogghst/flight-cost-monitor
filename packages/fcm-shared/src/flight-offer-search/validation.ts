import { z } from 'zod'
import { SearchType } from '../user-search/types.js'
import { TravelClass } from './types.js'

export const SearchParamsSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  searchType: z.nativeEnum(SearchType).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  travelClass: z.nativeEnum(TravelClass).optional(),
  carriers: z.array(z.string()).optional(),
})

export const validateSearchParams = (params: unknown) => {
  return SearchParamsSchema.parse(params)
}
