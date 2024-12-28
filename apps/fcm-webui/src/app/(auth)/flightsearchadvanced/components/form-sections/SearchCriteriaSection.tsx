'use client'

import { Box, Card, CardContent, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material'
import { Controller } from 'react-hook-form'
import { FormSectionProps } from './types'

export function SearchCriteriaSection({ control, isLoading }: FormSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Search Criteria</Typography>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Controller
              name="currencyCode"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField {...field} fullWidth label="Currency Code" placeholder="EUR" disabled={isLoading} slotProps={{ htmlInput: { maxLength: 3 } }} onChange={(e) => field.onChange(e.target.value.toUpperCase() ?? '')} />
              )}
            />

            <Controller
              name="searchCriteria.maxFlightOffers"
              control={control}
              defaultValue={10}
              render={({ field }) => (
                <TextField {...field} fullWidth type="number" label="Max Flight Offers" disabled={isLoading} slotProps={{ htmlInput: { min: 1, max: 250 } }} onChange={(e) => field.onChange(Number(e.target.value ?? '10'))} />
              )}
            />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr 1fr',
            }}
            gap={3}>
            <Controller
              name="searchCriteria.maxPrice"
              control={control}
              defaultValue={1000}
              render={({ field }) => <TextField {...field} fullWidth type="number" label="Max Price" disabled={isLoading} slotProps={{ htmlInput: { min: 0 } }} onChange={(e) => field.onChange(Number(e.target.value ?? 1000))} />}
            />

            <Controller
              name="searchCriteria.oneFlightOfferPerDay"
              control={control}
              defaultValue={false}
              render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="One Offer Per Day" />}
            />

            <Controller
              name="searchCriteria.addOneWayOffers"
              control={control}
              defaultValue={false}
              render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Include One-Way" />}
            />
          </Box>

          <Controller
            name="searchCriteria.excludeAllotments"
            control={control}
            defaultValue={false}
            render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Exclude Allotments" />}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
