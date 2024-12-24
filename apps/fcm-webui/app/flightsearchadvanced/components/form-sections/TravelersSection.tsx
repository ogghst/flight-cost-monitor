'use client'

import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { Box, Card, CardContent, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { Controller, useFieldArray } from 'react-hook-form'
import { FormSectionProps } from './types'

export function TravelersSection({ control, isLoading }: FormSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'travelers',
  })

  const addTraveler = () => {
    if (fields.length < 9) {
      append({
        id: (fields.length + 1).toString(),
        travelerType: 'ADULT',
      })
    }
  }

  return (
    <Stack spacing={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Travelers</Typography>
        <Tooltip title="Add traveler (max 9)">
          <span>
            <IconButton onClick={addTraveler} color="primary" disabled={fields.length >= 9 || isLoading}>
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {fields.map((field, index) => (
        <Card key={field.id} variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Traveler {index + 1}</Typography>
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
                  sm: '2fr 1fr',
                }}
                gap={3}>
                <Controller
                  name={`travelers.${index}.travelerType`}
                  control={control}
                  defaultValue="ADULT"
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Traveler Type" disabled={isLoading}>
                      {(['ADULT', 'CHILD', 'HELD_INFANT', 'SEATED_INFANT'] as const).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {field.travelerType === 'HELD_INFANT' && (
                  <Controller
                    name={`travelers.${index}.associatedAdultId`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField {...field} select fullWidth label="Associated Adult" disabled={isLoading}>
                        {fields
                          .filter((t) => t.travelerType === 'ADULT')
                          .map((adult, adultIndex) => (
                            <MenuItem key={adult.id} value={adult.id}>
                              Adult {adultIndex + 1}
                            </MenuItem>
                          ))}
                      </TextField>
                    )}
                  />
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
