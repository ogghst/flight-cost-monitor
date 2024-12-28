'use client'

import { FlightOfferList } from '@/components/flights/FlightOfferList'
import {
  Alert,
  Container,
  debounce,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback } from 'react'
import { FlightSearchForm } from './components/FlightSearchForm'

import { searchFlights } from '@/lib/api/flights/flight-search'
import {
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'

const DEBOUNCE_TIME = 300 // 300ms

// Configure axios once
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
axios.defaults.baseURL = API_URL

export default function FlightSearchPage() {
  const queryClient = useQueryClient()

  const {
    mutate: searchFlightMutation,
    isPending,
    error,
    data: searchResponse,
  } = useMutation({
    mutationFn: async (searchParams: FlightOfferSimpleSearchRequest) => {
      const cacheKey = JSON.stringify(searchParams)
      const cachedData =
        queryClient.getQueryData<FlightOfferSimpleSearchResponse>([
          'flightSearch',
          cacheKey,
        ])

      if (cachedData) {
        return cachedData
      }

      const data = await searchFlights(searchParams)
      queryClient.setQueryData(['flightSearch', cacheKey], data)
      return data
    },
    retry: 1,
    onError: (error: any) => {
      console.error('Search error:', error)
    },
  })

  // Debounced submit handler
  const debouncedSubmit = useCallback(
    debounce((data: FlightOfferSimpleSearchRequest) => {
      searchFlightMutation(data)
    }, DEBOUNCE_TIME),
    [searchFlightMutation]
  )

  const handleSubmit = (data: FlightOfferSimpleSearchRequest) => {
    debouncedSubmit(data)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Flight Search
        </Typography>

        {isPending && (
          <LinearProgress
            sx={{
              width: '100%',
              borderRadius: 1,
              height: 6,
            }}
          />
        )}

        <FlightSearchForm onSubmit={handleSubmit} isLoading={isPending} />

        {error && (
          <Alert severity="error">
            {axios.isAxiosError(error)
              ? error.response?.data?.message || 'Error searching flights'
              : 'Error searching flights'}
          </Alert>
        )}

        {searchResponse && (
          <FlightOfferList
            offers={searchResponse.data}
            dictionaries={searchResponse.dictionaries}
          />
        )}
      </Stack>
    </Container>
  )
}
