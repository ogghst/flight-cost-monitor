'use client'

import { FlightOfferList } from '@/components/flights/FlightOfferList'
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

import { searchFlightsAction } from '@/app/actions/flight-search'
import { useSearchForm } from '@/components/context/SearchFormContext'
import { LoadSearchButton } from '@/components/search/LoadSearchButton'
import { SaveSearchButton } from '@/components/search/SaveSearchButton'
import {
  FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'
import { SearchType } from '@fcm/shared/auth'
import { FlightSearchForm } from './components/FlightSearchForm'

const DEBOUNCE_TIME = 300

export default function FlightSearchPage() {
  // Access our centralized search context
  const { currentSearch } = useSearchForm()
  const queryClient = useQueryClient()
  const [isUserSearchActive, setIsUserSearchActive] = useState(false)

  // Define the search mutation with proper error handling
  const {
    mutate: searchFlightMutation,
    isPending,
    error,
    data: searchResponse,
    reset: resetSearchResults,
  } = useMutation({
    mutationFn: async (searchParams: FlightOfferSimpleSearchRequest) => {
      // Use the search parameters as the cache key
      const cacheKey = JSON.stringify(searchParams)
      const cachedData =
        queryClient.getQueryData<FlightOfferSimpleSearchResponse>([
          'flightSearch',
          cacheKey,
        ])

      // Return cached data if available
      if (cachedData) {
        return cachedData
      }

      // Include the savedSearchId if we're using a saved search
      const data = await searchFlightsAction(searchParams, currentSearch?.id)

      // Cache the response for future use
      queryClient.setQueryData(['flightSearch', cacheKey], data)
      return data
    },
    retry: 1,
    onError: (error: any) => {
      console.error('Search error:', error)
    },
  })

  // Create a debounced submit function to prevent too many API calls
  const debouncedSubmit = useCallback(
    debounce((data: FlightOfferSimpleSearchRequest) => {
      searchFlightMutation(data)
    }, DEBOUNCE_TIME),
    [searchFlightMutation]
  )

  // Handle form submissions
  const handleSubmit = (data: FlightOfferSimpleSearchRequest) => {
    debouncedSubmit(data)
  }

  // Handle loading a saved search
  const handleLoadSearch = (criteria: FlightOfferSimpleSearchRequest) => {
    resetSearchResults()
    // The search context is already updated by LoadSearchButton
    // Just need to trigger the search with the loaded criteria
    searchFlightMutation(criteria)
    setIsUserSearchActive(true)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header with search actions */}
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
            {/* Search management buttons */}
            <SaveSearchButton searchType={SearchType.SIMPLE} />
            <LoadSearchButton
              searchType={SearchType.SIMPLE}
              onLoadSearch={handleLoadSearch}
            />
          </Box>
        </Box>

        {/* Loading indicator */}
        {isPending && (
          <LinearProgress
            sx={{
              width: '100%',
              borderRadius: 1,
              height: 6,
            }}
          />
        )}

        {/* Search form */}
        <FlightSearchForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          isFieldsDisabled={isUserSearchActive}
          initialValues={
            currentSearch
              ? currentSearch.parameters
              : FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES
          }
        />

        {/* Error display */}
        {error && (
          <Alert severity="error">
            {axios.isAxiosError(error)
              ? error.response?.data?.message || 'Error searching flights'
              : 'Error searching flights'}
          </Alert>
        )}

        {/* Search results */}
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
