'use client'

import { getCurrentUser } from '@/app/actions/user'
import { useSearchForm } from '@/components/context/SearchFormContext'
import {
  FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
  FlightOfferSimpleSearchRequest,
} from '@fcm/shared/amadeus/clients/flight-offer'
import { TravelClass } from '@fcm/shared/amadeus/types'
import { AuthUser } from '@fcm/shared/auth'
import { SearchType } from '@fcm/shared/user-search'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Controller, useForm, useFormState } from 'react-hook-form'
import { z } from 'zod'

// Schema to validate the flight search form
const flightSearchSchema = z.object({
  originLocationCode: z
    .string()
    .length(3, 'Airport code must be exactly 3 characters')
    .toUpperCase(),
  destinationLocationCode: z
    .string()
    .length(3, 'Airport code must be exactly 3 characters')
    .toUpperCase(),
  departureDate: z.string(), //.regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format'),
  returnDate: z.string(), //.regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format'),
  adults: z
    .number()
    .int('Must be a whole number')
    .min(1, 'At least 1 adult required')
    .max(9, 'Maximum 9 adults'),
  children: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(9, 'Maximum 9 children')
    .optional(),
  infants: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(9, 'Maximum 9 infants')
    .optional(),
  travelClass: z.nativeEnum(TravelClass).optional(),
  nonStop: z.boolean().optional(),
  currencyCode: z
    .string()
    .length(3, 'Currency code must be exactly 3 characters')
    .toUpperCase()
    .optional(),
  maxResults: z
    .number()
    .int('Must be a whole number')
    .min(1, 'At least 1 result')
    .max(250, 'Maximum 250 results')
    .optional(),
  maxPrice: z.number().positive('Price must be positive').optional(),
  includedAirlineCodes: z.array(z.string()).optional(),
  excludedAirlineCodes: z.array(z.string()).optional(),
}) satisfies z.ZodType<FlightOfferSimpleSearchRequest>

type FlightSearchFormProps = {
  onSubmit: (data: FlightOfferSimpleSearchRequest) => void
  initialValues?: FlightOfferSimpleSearchRequest
  isLoading?: boolean
  isFieldsDisabled?: boolean
}

export function FlightSearchForm({
  onSubmit,
  initialValues = FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
  isLoading = false,
  isFieldsDisabled = false,
}: FlightSearchFormProps) {
  const { currentSearch, setCurrentSearch } = useSearchForm()
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  // Parse the current search parameters if they exist
  const getInitialValues = () => {
    if (currentSearch?.parameters) {
      try {
        return JSON.parse(currentSearch.parameters)
      } catch {
        return initialValues
      }
    }
    return initialValues
  }

  const { control, handleSubmit, reset, getValues } =
    useForm<FlightOfferSimpleSearchRequest>({
      resolver: zodResolver(flightSearchSchema),
      defaultValues: getInitialValues(),
    })

  const { errors, dirtyFields } = useFormState({
    control,
  })

  // Update context when form fields change
  useEffect(() => {
    if (Object.keys(dirtyFields).length > 0) {
      const formValues = getValues()

      if (currentSearch) {
        setCurrentSearch({
          ...currentSearch,
          parameters: JSON.stringify(formValues),
        })
      } else {
        setCurrentSearch({
          parameters: JSON.stringify(formValues),
          deletedAt: null,
          favorite: false,
          lastUsed: new Date(),
          updatedAt: new Date(),
          id: '',
          createdAt: new Date(),
          userEmail: currentUser?.email ?? '',
          searchType: SearchType.SIMPLE,
        })
      }
    }
  }, [
    dirtyFields,
    getValues,
    currentSearch,
    setCurrentSearch,
    currentUser?.email,
    currentUser?.id,
  ])

  // Reset form when initialValues or currentSearch changes
  useEffect(() => {
    const newValues = getInitialValues()
    reset(newValues)
  }, [reset, initialValues, currentSearch])

  const handleFormSubmit = (data: FlightOfferSimpleSearchRequest) => {
    if (currentSearch) {
      setCurrentSearch({
        ...currentSearch,
        parameters: JSON.stringify(data),
        lastUsed: new Date(),
        updatedAt: new Date(),
      })
    } else {
      setCurrentSearch({
        id: '',
        name: 'Untitled Search',
        searchType: SearchType.SIMPLE,
        parameters: JSON.stringify(data),
        userEmail: currentUser?.email ?? '',
        createdAt: new Date(),
        lastUsed: new Date(),
        updatedAt: new Date(),
        favorite: false,
        deletedAt: null,
      })
    }

    onSubmit(data)
  }

  return (
    <Card>
      <CardContent>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate>
          <Stack spacing={3}>
            {/* Location Selection */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
              }}
              gap={3}>
              <Controller
                name="originLocationCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    label="Origin Airport"
                    error={!!errors.originLocationCode}
                    helperText={errors.originLocationCode?.message}
                    inputProps={{ maxLength: 3 }}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />

              <Controller
                name="destinationLocationCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    label="Destination Airport"
                    error={!!errors.destinationLocationCode}
                    helperText={errors.destinationLocationCode?.message}
                    inputProps={{ maxLength: 3 }}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />
            </Box>

            {/* Dates */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
              }}
              gap={3}>
              <Controller
                name="departureDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    value={dayjs(field.value)}
                    label="Departure Date"
                    slotProps={{
                      textField: {
                        disabled: isFieldsDisabled || isLoading,
                        fullWidth: true,
                        error: !!errors.departureDate,
                        helperText: errors.departureDate?.message,
                      },
                    }}
                    onChange={(date) => {
                      if (date) {
                        field.onChange(date.toISOString().split('T')[0])
                      }
                    }}
                  />
                )}
              />

              <Controller
                name="returnDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    value={dayjs(field.value)}
                    label="Return Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        disabled: isFieldsDisabled || isLoading,
                        error: !!errors.returnDate,
                        helperText: errors.returnDate?.message,
                      },
                    }}
                    onChange={(date) => {
                      if (date) {
                        field.onChange(date.toISOString().split('T')[0])
                      }
                    }}
                  />
                )}
              />
            </Box>

            {/* Passenger Information */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr 1fr',
              }}
              gap={3}>
              <Controller
                name="adults"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    type="number"
                    label="Adults"
                    error={!!errors.adults}
                    helperText={errors.adults?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="children"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    type="number"
                    label="Children"
                    error={!!errors.children}
                    helperText={errors.children?.message}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="infants"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    type="number"
                    label="Infants (under 2)"
                    error={!!errors.infants}
                    helperText={errors.infants?.message}
                    InputProps={{
                      inputProps: { min: 0, max: 9 },
                    }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Box>

            {/* Travel Class and Currency */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
              }}
              gap={3}>
              <Controller
                name="travelClass"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    select
                    fullWidth
                    label="Travel Class"
                    error={!!errors.travelClass}
                    helperText={errors.travelClass?.message}>
                    {Object.entries(TravelClass).map(([key, value]) => (
                      <MenuItem
                        component="li"
                        key={key}
                        value={value as string}>
                        {key.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="currencyCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    label="Currency Code"
                    error={!!errors.currencyCode}
                    helperText={errors.currencyCode?.message}
                    inputProps={{ maxLength: 3 }}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />
            </Box>

            {/* Price and Non-Stop Flight Option */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
              }}
              gap={3}>
              <Controller
                name="maxPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    type="number"
                    label="Maximum Price"
                    error={!!errors.maxPrice}
                    helperText={errors.maxPrice?.message}
                    InputProps={{ inputProps: { min: 1 } }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              <Controller
                name="nonStop"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        disabled={isFieldsDisabled || isLoading}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Non-stop flights only"
                  />
                )}
              />
            </Box>

            {/* Airline Preferences */}
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
              }}
              gap={3}>
              <Controller
                name="includedAirlineCodes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    label="Included Airlines"
                    error={!!errors.includedAirlineCodes}
                    helperText={
                      errors.includedAirlineCodes?.message ||
                      'Comma-separated IATA codes'
                    }
                    placeholder="AA,BA,LH"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? e.target.value.split(',') : []
                      )
                    }
                  />
                )}
              />

              <Controller
                name="excludedAirlineCodes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isFieldsDisabled || isLoading}
                    fullWidth
                    label="Excluded Airlines"
                    error={!!errors.excludedAirlineCodes}
                    helperText={
                      errors.excludedAirlineCodes?.message ||
                      'Comma-separated IATA codes'
                    }
                    placeholder="FR,U2,W6"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? e.target.value.split(',') : []
                      )
                    }
                  />
                )}
              />
            </Box>

            {/* Results Limit */}
            <Controller
              name="maxResults"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  disabled={isFieldsDisabled || isLoading}
                  fullWidth
                  type="number"
                  label="Max Results"
                  error={!!errors.maxResults}
                  helperText={errors.maxResults?.message}
                  InputProps={{
                    inputProps: { min: 1, max: 250 },
                  }}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            {/* Search Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Flights'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
