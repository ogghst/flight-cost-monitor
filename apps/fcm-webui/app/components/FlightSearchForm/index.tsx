'use client'

import {
    FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
    FlightOffersGetParams,
    TravelClass,
} from '@fcm/shared/amadeus/types'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { Controller, useForm } from 'react-hook-form'
import { searchFlightSchema, type FlightSearchFormValues } from './validation'

interface FlightSearchFormProps {
    onSubmit: (values: FlightOffersGetParams) => Promise<void>
    isLoading?: boolean
}

export function FlightSearchForm({
    onSubmit,
    isLoading = false,
}: FlightSearchFormProps) {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<FlightSearchFormValues>({
        resolver: zodResolver(searchFlightSchema),
        defaultValues: FLIGHT_OFFERS_DEFAULT_SEARCH_VALUES,
    })

    const onFormSubmit = handleSubmit(async (values) => {
        const searchRequest: FlightOffersGetParams = {
            ...values,
            departureDate: values.departureDate!.format('YYYY-MM-DD'),
            returnDate: values.returnDate!.format('YYYY-MM-DD'),
        }
        await onSubmit(searchRequest)
    })

    return (
        <Box component="form" onSubmit={onFormSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Origin Airport (IATA)"
                        error={!!errors.originLocationCode}
                        helperText={errors.originLocationCode?.message}
                        inputProps={{
                            maxLength: 3,
                            style: { textTransform: 'uppercase' },
                        }}
                        {...register('originLocationCode')}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Destination Airport (IATA)"
                        error={!!errors.destinationLocationCode}
                        helperText={errors.destinationLocationCode?.message}
                        inputProps={{
                            maxLength: 3,
                            style: { textTransform: 'uppercase' },
                        }}
                        {...register('destinationLocationCode')}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="departureDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Departure Date"
                                value={field.value}
                                onChange={field.onChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.departureDate,
                                        helperText:
                                            errors.departureDate?.message,
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="returnDate"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Return Date"
                                value={field.value}
                                onChange={field.onChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.returnDate,
                                        helperText: errors.returnDate?.message,
                                    },
                                }}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="travelClass"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel>Travel Class</InputLabel>
                                <Select {...field} label="Travel Class">
                                    <MenuItem value={TravelClass.ECONOMY}>
                                        Economy
                                    </MenuItem>
                                    <MenuItem
                                        value={TravelClass.PREMIUM_ECONOMY}
                                    >
                                        Premium Economy
                                    </MenuItem>
                                    <MenuItem value={TravelClass.BUSINESS}>
                                        Business
                                    </MenuItem>
                                    <MenuItem value={TravelClass.FIRST}>
                                        First
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Adults"
                        error={!!errors.adults}
                        helperText={errors.adults?.message}
                        InputProps={{ inputProps: { min: 1, max: 9 } }}
                        {...register('adults', { valueAsNumber: true })}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Children (2-11)"
                        error={!!errors.children}
                        helperText={errors.children?.message}
                        InputProps={{ inputProps: { min: 0, max: 9 } }}
                        {...register('children', { valueAsNumber: true })}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        type="number"
                        label="Maximum Results"
                        error={!!errors.maxResults}
                        helperText={errors.maxResults?.message}
                        InputProps={{ inputProps: { min: 1, max: 250 } }}
                        {...register('maxResults', { valueAsNumber: true })}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControlLabel
                        control={
                            <Controller
                                name="nonStop"
                                control={control}
                                render={({ field }) => (
                                    <Switch {...field} checked={field.value} />
                                )}
                            />
                        }
                        label="Non-stop flights only"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading || !isDirty || isSubmitting}
                    >
                        {isLoading ? 'Searching...' : 'Search Flights'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    )
}
