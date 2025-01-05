'use client'

import { FlightOfferList } from '@/components/flights/FlightOfferList'
import { LoadSearchButton } from '@/components/search/LoadSearchButton'
import { SaveSearchButton } from '@/components/search/SaveSearchButton'

import {
  Alert,
  Box,
  Container,
  debounce,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useCallback, useState } from 'react'
import { FlightSearchForm } from './components/FlightSearchForm'

import { searchFlightsAction } from '@/app/actions/flight-search'
import {
  FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'
import { SearchType } from '@fcm/shared/auth'

const DEBOUNCE_TIME = 300

export default function FlightSearchPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<FlightOfferSimpleSearchRequest>(
    FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES
  )
  const [currentSearch, setCurrentSearch] =
    useState<FlightOfferSimpleSearchRequest>(
      FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES
    )

  const {
    mutate: searchFlightMutation,
    isPending,
    error,
    data: searchResponse,
    reset: resetSearchResults,
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

      const data = await searchFlightsAction(searchParams)
      queryClient.setQueryData(['flightSearch', cacheKey], data)
      return data
    },
    retry: 1,
    onError: (error: any) => {
      console.error('Search error:', error)
    },
  })

  const debouncedSubmit = useCallback(
    debounce((data: FlightOfferSimpleSearchRequest) => {
      setCurrentSearch(data)
      searchFlightMutation(data)
    }, DEBOUNCE_TIME),
    [searchFlightMutation]
  )

  const handleSubmit = (data: FlightOfferSimpleSearchRequest) => {
    debouncedSubmit(data)
  }

  const handleLoadSearch = (criteria: FlightOfferSimpleSearchRequest) => {
    // Clear previous search results when loading a saved search
    resetSearchResults()
    setFormData(criteria)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Typography variant="h4" component="h1">
            Flight Search
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <SaveSearchButton
              searchParameter={JSON.stringify(currentSearch)}
              searchType={SearchType.SIMPLE}
              isSimpleSearch
            />
            <LoadSearchButton
              searchType={SearchType.SIMPLE}
              onLoadSearch={handleLoadSearch}
            />
          </Box>
        </Box>

        {isPending && (
          <LinearProgress
            sx={{
              width: '100%',
              borderRadius: 1,
              height: 6,
            }}
          />
        )}

        <FlightSearchForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          initialValues={formData}
        />

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
