'use client'

import { FlightOfferSearchResponse } from '@fcm/api'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material'
import { ExpandMore, FlightTakeoff, FlightLand } from '@mui/icons-material'
import dayjs from 'dayjs'
import { FlightOfferCard } from './FlightOfferCard'

interface FlightOfferListProps {
    response: FlightOfferSearchResponse
}

export function FlightOfferList({ response }: FlightOfferListProps) {
    if (!response.data.length) {
        return (
            <Card>
                <CardContent>
                    <Typography>No flight offers found</Typography>
                </CardContent>
            </Card>
        )
    }

    const formatTime = (dateTime: string) => dayjs(dateTime).format('HH:mm')
    const formatDuration = (duration: string) => {
        const hours = duration.match(/(\d+)H/)?.[1] || '0'
        const minutes = duration.match(/(\d+)M/)?.[1] || '0'
        return `${hours}h ${minutes}m`
    }

    return (
        <Stack spacing={2}>
            <Typography variant="h6">
                Found {response.data.length} flight offers
            </Typography>

            {response.data.map((offer, index) => {
                const outbound = offer.itineraries[0]
                const inbound = offer.itineraries[1]
                const firstSegment = outbound.segments[0]
                const lastOutboundSegment = outbound.segments[outbound.segments.length - 1]
                
                return (
                    <Accordion key={offer.id} disableGutters>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Grid container spacing={2} alignItems="center">
                                {/* Price and Airline */}
                                <Grid item xs={12} sm={3}>
                                    <Stack>
                                        <Typography variant="h6" color="primary">
                                            {Number(offer.price.total).toLocaleString(undefined, {
                                                style: 'currency',
                                                currency: offer.price.currency,
                                            })}
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip 
                                                label={offer.validatingAirlineCodes[0]}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {outbound.segments.length > 1 && (
                                                <Chip 
                                                    label={`${outbound.segments.length} stops`}
                                                    size="small"
                                                    color="warning"
                                                />
                                            )}
                                        </Stack>
                                    </Stack>
                                </Grid>

                                {/* Outbound Flight */}
                                <Grid item xs={12} sm={4}>
                                    <Stack spacing={1}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <FlightTakeoff fontSize="small" />
                                                <Typography>
                                                    {firstSegment.departure.iataCode} 
                                                    <Typography component="span" color="text.secondary">
                                                        {` ${formatTime(firstSegment.departure.at)}`}
                                                    </Typography>
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography>
                                                    {lastOutboundSegment.arrival.iataCode}
                                                    <Typography component="span" color="text.secondary">
                                                        {` ${formatTime(lastOutboundSegment.arrival.at)}`}
                                                    </Typography>
                                                </Typography>
                                                <FlightLand fontSize="small" />
                                            </Stack>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" align="center">
                                            Duration: {formatDuration(outbound.duration)}
                                        </Typography>
                                    </Stack>
                                </Grid>

                                {/* Return Flight */}
                                {inbound && (
                                    <>
                                        <Grid item xs={12} sm={1}>
                                            <Divider orientation="vertical" />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Stack spacing={1}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FlightTakeoff fontSize="small" />
                                                        <Typography>
                                                            {inbound.segments[0].departure.iataCode}
                                                            <Typography component="span" color="text.secondary">
                                                                {` ${formatTime(inbound.segments[0].departure.at)}`}
                                                            </Typography>
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Typography>
                                                            {inbound.segments[inbound.segments.length - 1].arrival.iataCode}
                                                            <Typography component="span" color="text.secondary">
                                                                {` ${formatTime(inbound.segments[inbound.segments.length - 1].arrival.at)}`}
                                                            </Typography>
                                                        </Typography>
                                                        <FlightLand fontSize="small" />
                                                    </Stack>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" align="center">
                                                    Duration: {formatDuration(inbound.duration)}
                                                </Typography>
                                            </Stack>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FlightOfferCard offer={offer} />
                        </AccordionDetails>
                    </Accordion>
                )
            })}
        </Stack>
    )
}