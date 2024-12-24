'use client'

import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { Box, Card, CardContent, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { DatePicker, TimeField } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { Controller, useFieldArray } from 'react-hook-form'
import { FormSectionProps } from './types'

export function FlightSegmentSection({ control, isLoading }: FormSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'originDestinations',
  })

  const addSegment = () => {
    if (fields.length < 6) {
      append({
        id: (fields.length + 1).toString(),
        originLocationCode: '',
        destinationLocationCode: '',
        departureDateTimeRange: {
          date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        },
      })
    }
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Flight Segments</Typography>
        <Tooltip title="Add flight segment (max 6)">
          <span>
            <IconButton onClick={addSegment} color="primary" disabled={fields.length >= 6 || isLoading}>
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {fields.map((field, index) => (
        <Card key={field.id} variant="outlined">
          <CardContent>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Segment {index + 1}</Typography>
                {index > 0 && (
                  <IconButton onClick={() => remove(index)} color="error" size="small" disabled={isLoading}>
                    <RemoveIcon />
                  </IconButton>
                )}
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: '1fr',
                  sm: '1fr 1fr',
                }}
                gap={3}>
                <Controller
                  name={`originDestinations.${index}.originLocationCode`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} fullWidth label="Origin Airport" disabled={isLoading} slotProps={{ htmlInput: { maxLength: 3 } }} onChange={(e) => field.onChange(e.target.value.toUpperCase() ?? '')} />}
                />

                <Controller
                  name={`originDestinations.${index}.destinationLocationCode`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} fullWidth label="Destination Airport" disabled={isLoading} slotProps={{ htmlInput: { maxLength: 3 } }} onChange={(e) => field.onChange(e.target.value.toUpperCase() ?? '')} />}
                />
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{
                  xs: '1fr',
                  sm: '2fr 1fr',
                }}
                gap={3}>
                <Controller
                  name={`originDestinations.${index}.departureDateTimeRange.date`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Departure Date"
                      value={dayjs(field.value)}
                      disabled={isLoading}
                      onChange={(date) => {
                        if (date) {
                          field.onChange(date.format('YYYY-MM-DD') ?? '')
                        }
                      }}
                    />
                  )}
                />

                <Controller
                  name={`originDestinations.${index}.departureDateTimeRange.time`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TimeField
                      {...field}
                      label="Departure Time"
                      value={field.value ? dayjs(field.value, 'HH:mm:ss') : null}
                      disabled={isLoading}
                      onChange={(time) => {
                        if (time) {
                          field.onChange(time.format('HH:mm:ss') ?? '')
                        }
                      }}
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
                  name={`originDestinations.${index}.departureDateTimeRange.dateWindow`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} fullWidth label="Date Window" placeholder="e.g., P3D" disabled={isLoading} helperText="Format: P3D (plus), M3D (minus), or I3D (interval)" onChange={(e) => field.onChange(e.target.value ?? '')} />
                  )}
                />

                <Controller
                  name={`originDestinations.${index}.departureDateTimeRange.timeWindow`}
                  control={control}
                  defaultValue=""
                  render={({ field }) => <TextField {...field} fullWidth label="Time Window" placeholder="e.g., 3H" disabled={isLoading} helperText="Format: 1-12H" onChange={(e) => field.onChange(e.target.value ?? '')} />}
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
                  name={`originDestinations.${index}.alternativeOriginsCodes`}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Alternative Origins"
                      placeholder="CDG,FRA"
                      disabled={isLoading}
                      helperText="Max 2 airports, comma separated"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((code) => code.trim().toUpperCase())
                            .slice(0, 2)
                        )
                      }
                    />
                  )}
                />

                <Controller
                  name={`originDestinations.${index}.alternativeDestinationsCodes`}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Alternative Destinations"
                      placeholder="LHR,AMS"
                      disabled={isLoading}
                      helperText="Max 2 airports, comma separated"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((code) => code.trim().toUpperCase())
                            .slice(0, 2) ?? []
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
                  name={`originDestinations.${index}.includedConnectionPoints`}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Included Connections"
                      placeholder="MUC,VIE"
                      disabled={isLoading}
                      helperText="Max 2 airports, comma separated"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((code) => code.trim().toUpperCase())
                            .slice(0, 2) ?? []
                        )
                      }
                    />
                  )}
                />

                <Controller
                  name={`originDestinations.${index}.excludedConnectionPoints`}
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Excluded Connections"
                      placeholder="IST,DOH,DXB"
                      disabled={isLoading}
                      helperText="Max 3 airports, comma separated"
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((code) => code.trim().toUpperCase())
                            .slice(0, 3) ?? []
                        )
                      }
                    />
                  )}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
