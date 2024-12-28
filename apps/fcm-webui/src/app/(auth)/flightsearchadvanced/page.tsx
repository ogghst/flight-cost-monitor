'use client'

import { FlightOfferList } from '@/components/flights/FlightOfferList'
import {
  FlightOffersAdvancedResponse,
  FlightOffersAdvancedSearchRequest,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'
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
import { searchFlightsAdvanced } from 'src/lib/api/flights/flight-search'
import { FlightSearchAdvancedForm } from './components/FlightSearchAdvancedForm'

const DEBOUNCE_TIME = 300 // 300ms

// Configure axios once
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
axios.defaults.baseURL = API_URL

interface Warning {
  status: number
  code: number
  title: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
    example?: string
  }
}

export default function FlightSearchAdvancedPage() {
  const queryClient = useQueryClient()

  const {
    mutate: searchFlights,
    isPending,
    error,
    data: searchResponse,
  } = useMutation({
    mutationFn: async (searchParams: FlightOffersAdvancedSearchRequest) => {
      const cacheKey = JSON.stringify(searchParams)
      const cachedData = queryClient.getQueryData<FlightOffersAdvancedResponse>(
        ['advancedFlightSearch', cacheKey]
      )

      if (cachedData) {
        return cachedData
      }

      const data = await searchFlightsAdvanced(searchParams)
      queryClient.setQueryData(['advancedFlightSearch', cacheKey], data)
      return data
    },
    retry: 1,
    onError: (error: any) => {
      console.error('Search error:', error)
    },
  })

  // Debounced submit handler
  const debouncedSubmit = useCallback(
    debounce((data: FlightOffersAdvancedSearchRequest) => {
      searchFlights(data)
    }, DEBOUNCE_TIME),
    [searchFlights]
  )

  const handleSubmit = (data: FlightOffersAdvancedSearchRequest) => {
    debouncedSubmit(data)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Advanced Flight Search
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

        <FlightSearchAdvancedForm
          onSubmit={handleSubmit}
          isLoading={isPending}
        />

        {error && (
          <Alert severity="error">
            {axios.isAxiosError(error)
              ? error.response?.data?.message || 'Error searching flights'
              : 'Error searching flights'}
          </Alert>
        )}

        {searchResponse?.warnings && searchResponse.warnings.length > 0 && (
          <Alert severity="warning">
            {searchResponse.warnings.map((warning: Warning, index: number) => (
              <Typography key={index}>
                {warning.title}: {warning.detail || 'No details available'}
              </Typography>
            ))}
          </Alert>
        )}

        {searchResponse?.data && (
          <>
            {searchResponse.meta.oneWayCombinations && (
              <Alert severity="info">
                Found {searchResponse.meta.oneWayCombinations.length} one-way
                combinations
              </Alert>
            )}
            <FlightOfferList
              offers={searchResponse.data}
              dictionaries={searchResponse.dictionaries}
            />
          </>
        )}
      </Stack>
    </Container>
  )
}
