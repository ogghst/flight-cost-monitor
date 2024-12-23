'use client'

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
import { FlightOfferList } from '../components/FlightOfferList'
import { FlightSearchForm } from './components/FlightSearchForm'

import {
    FlightOfferSearchResponse,
    FlightOffersGetParams,
} from '@fcm/shared/amadeus/clients/flight-offer'

const DEBOUNCE_TIME = 300 // 300ms

// Configure axios once
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
axios.defaults.baseURL = API_URL

export default function FlightSearchPage() {
    const queryClient = useQueryClient()

    const {
        mutate: searchFlights,
        isPending,
        error,
        data: searchResponse,
    } = useMutation({
        mutationFn: async (searchParams: FlightOffersGetParams) => {
            const cacheKey = JSON.stringify(searchParams)
            const cachedData =
                queryClient.getQueryData<FlightOfferSearchResponse>([
                    'flightSearch',
                    cacheKey,
                ])

            if (cachedData) {
                return cachedData
            }

            const { data } = await axios.post<FlightOfferSearchResponse>(
                '/flight-offers/simple',
                searchParams
            )
            queryClient.setQueryData(['flightSearch', cacheKey], data)
            return data
        },
        retry: 1,
        onError: (error) => {
            console.error('Search error:', error)
        },
    })

    // Debounced submit handler
    const debouncedSubmit = useCallback(
        debounce((data: FlightOffersGetParams) => {
            searchFlights(data)
        }, DEBOUNCE_TIME),
        [searchFlights]
    )

    const handleSubmit = (data: FlightOffersGetParams) => {
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

                <FlightSearchForm
                    onSubmit={handleSubmit}
                    isLoading={isPending}
                />

                {error && (
                    <Alert severity="error">
                        {axios.isAxiosError(error)
                            ? error.response?.data?.message ||
                              'Error searching flights'
                            : 'Error searching flights'}
                    </Alert>
                )}

                {searchResponse && (
                    <FlightOfferList response={searchResponse} />
                )}
            </Stack>
        </Container>
    )
}
