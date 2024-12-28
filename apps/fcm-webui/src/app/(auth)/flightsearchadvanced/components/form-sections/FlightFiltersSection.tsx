'use client'

import { Box, Card, CardContent, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material'
import { Controller } from 'react-hook-form'
import { FormSectionProps } from './types'

export function FlightFiltersSection({ control, isLoading }: FormSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Flight Filters</Typography>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Controller
              name="searchCriteria.flightFilters.carrierRestrictions.includedCarrierCodes"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Included Airlines"
                  placeholder="LH,BA,AF"
                  disabled={isLoading}
                  helperText="Max 99 airlines, comma separated"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(',')
                        .map((code) => code.trim().toUpperCase())
                        .slice(0, 99) ?? []
                    )
                  }
                />
              )}
            />

            <Controller
              name="searchCriteria.flightFilters.carrierRestrictions.excludedCarrierCodes"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Excluded Airlines"
                  placeholder="FR,U2,W6"
                  disabled={isLoading}
                  helperText="Max 99 airlines, comma separated"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value
                        .split(',')
                        .map((code) => code.trim().toUpperCase())
                        .slice(0, 99) ?? []
                    )
                  }
                />
              )}
            />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Controller
              name="searchCriteria.flightFilters.connectionRestriction.maxNumberOfConnections"
              control={control}
              defaultValue={2}
              render={({ field }) => <TextField {...field} fullWidth type="number" label="Max Connections" disabled={isLoading} inputProps={{ min: 0, max: 2 }} onChange={(e) => field.onChange(Number(e.target.value)) ?? 0} />}
            />

            <Controller
              name="searchCriteria.flightFilters.maxFlightTime"
              control={control}
              defaultValue={200}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Max Flight Time (%)"
                  disabled={isLoading}
                  helperText="Percentage relative to shortest flight time"
                  slotProps={{ htmlInput: { min: 0, max: 999 } }}
                  onChange={(e) => field.onChange(Number(e.target.value)) ?? 999}
                />
              )}
            />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Stack>
              <Controller
                name="searchCriteria.flightFilters.connectionRestriction.nonStopPreferred"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Prefer Non-Stop" />}
              />

              <Controller
                name="searchCriteria.flightFilters.connectionRestriction.airportChangeAllowed"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Allow Airport Change" />}
              />
            </Stack>

            <Stack>
              <Controller
                name="searchCriteria.flightFilters.railSegmentAllowed"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Allow Rail Segments" />}
              />

              <Controller
                name="searchCriteria.flightFilters.busSegmentAllowed"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Allow Bus Segments" />}
              />
            </Stack>
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Controller
              name="searchCriteria.flightFilters.crossBorderAllowed"
              control={control}
              defaultValue={false}
              render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Allow Cross Border" />}
            />

            <Controller
              name="searchCriteria.flightFilters.moreOvernightsAllowed"
              control={control}
              defaultValue={false}
              render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Allow Overnight Stops" />}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
