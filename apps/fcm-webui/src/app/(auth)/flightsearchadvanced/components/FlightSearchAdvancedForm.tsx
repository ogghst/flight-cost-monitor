'use client'

import { FLIGHT_OFFERS_DEFAULT_ADVANCED_VALUES, FlightOffersAdvancedSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { zodResolver } from '@hookform/resolvers/zod'
import { Box, Button, Card, CardContent, Stack } from '@mui/material'
import { useForm } from 'react-hook-form'
import { FlightFiltersSection, FlightSegmentSection, PricingOptionsSection, SearchCriteriaSection, TravelersSection } from './form-sections'
import { flightSearchAdvancedSchema } from './schema'

type FlightSearchAdvancedFormProps = {
  onSubmit: (data: FlightOffersAdvancedSearchRequest) => void
  isLoading?: boolean
}

export function FlightSearchAdvancedForm({ onSubmit, isLoading = false }: FlightSearchAdvancedFormProps) {
  const { control, handleSubmit } = useForm<FlightOffersAdvancedSearchRequest>({
    resolver: zodResolver(flightSearchAdvancedSchema),
    defaultValues: FLIGHT_OFFERS_DEFAULT_ADVANCED_VALUES,
  })

  return (
    <Card sx={{ margin: '0 auto' }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <FlightSegmentSection control={control} isLoading={isLoading} />
            <TravelersSection control={control} isLoading={isLoading} />
            <SearchCriteriaSection control={control} isLoading={isLoading} />
            <FlightFiltersSection control={control} isLoading={isLoading} />
            <PricingOptionsSection control={control} isLoading={isLoading} />

            <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Flights'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
