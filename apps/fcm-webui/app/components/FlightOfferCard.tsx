'use client'

import { FlightOffer } from '@fcm/shared/amadeus/types'
import { FlightLand, FlightTakeoff } from '@mui/icons-material'
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

interface FlightOfferCardProps {
    offer: FlightOffer
}

export function FlightOfferCard({ offer }: FlightOfferCardProps) {
    const formatDateTime = (dateTime: string) => {
        return dayjs(dateTime).format('MMM D, HH:mm')
    }

    const formatDuration = (duration: string) => {
        // Convert PT3H21M format to human readable
        const hours = duration.match(/(\d+)H/)?.[1] || '0'
        const minutes = duration.match(/(\d+)M/)?.[1] || '0'
        return `${hours}h ${minutes}m`
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Grid container spacing={2}>
                    {/* Price and Airline Info */}
                    <Grid item xs={12}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="h4" color="primary">
                                {Number(offer.price.total).toLocaleString(
                                    undefined,
                                    {
                                        style: 'currency',
                                        currency: offer.price.currency,
                                    }
                                )}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Chip
                                    label={offer.validatingAirlineCodes[0]}
                                    variant="outlined"
                                    color="primary"
                                />
                                <Chip
                                    label={`${offer.numberOfBookableSeats} seats`}
                                    variant="outlined"
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Flight Itineraries */}
                    {offer.itineraries.map((itinerary, index) => (
                        <Grid item xs={12} key={index}>
                            {index > 0 && <Divider sx={{ my: 2 }} />}

                            {itinerary.segments.map((segment, segIdx) => (
                                <Box
                                    key={segIdx}
                                    sx={{ mt: segIdx > 0 ? 2 : 0 }}
                                >
                                    <Grid container spacing={2}>
                                        {/* Departure */}
                                        <Grid item xs={5}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <FlightTakeoff color="primary" />
                                                <Box>
                                                    <Typography variant="h6">
                                                        {
                                                            segment.departure
                                                                .iataCode
                                                        }
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {formatDateTime(
                                                            segment.departure.at
                                                        )}
                                                    </Typography>
                                                    {segment.departure
                                                        .terminal && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Terminal{' '}
                                                            {
                                                                segment
                                                                    .departure
                                                                    .terminal
                                                            }
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </Grid>

                                        {/* Duration */}
                                        <Grid item xs={2}>
                                            <Box textAlign="center">
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {formatDuration(
                                                        segment.duration
                                                    )}
                                                </Typography>
                                                <Divider>
                                                    <Chip
                                                        label={`${segment.carrierCode} ${segment.number}`}
                                                        size="small"
                                                    />
                                                </Divider>
                                            </Box>
                                        </Grid>

                                        {/* Arrival */}
                                        <Grid item xs={5}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="flex-end"
                                            >
                                                <Box textAlign="right">
                                                    <Typography variant="h6">
                                                        {
                                                            segment.arrival
                                                                .iataCode
                                                        }
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {formatDateTime(
                                                            segment.arrival.at
                                                        )}
                                                    </Typography>
                                                    {segment.arrival
                                                        .terminal && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Terminal{' '}
                                                            {
                                                                segment.arrival
                                                                    .terminal
                                                            }
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <FlightLand color="primary" />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}

                            {/* Booking Class and Amenities */}
                            <Box sx={{ mt: 2 }}>
                                {offer.travelerPricings.map((pricing, idx) => (
                                    <Typography
                                        key={idx}
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {pricing.fareDetailsBySegment[0]?.cabin ?? 'Unknown'}{' '}
                                        ({pricing.travelerType})
                                        {idx < offer.travelerPricings.length - 1
                                            ? ', '
                                            : ''}
                                    </Typography>
                                ))}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    )
}
