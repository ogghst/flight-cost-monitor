'use client'

import { Dictionaries, FlightOffer } from '@fcm/shared/amadeus/types'
import { FlightLand, FlightTakeoff } from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

interface FlightOfferCardProps {
  offer: FlightOffer
  dictionaries?: Dictionaries
}

export function FlightOfferCard({ offer, dictionaries }: FlightOfferCardProps) {
  const formatDateTime = (dateTime: string) => {
    return dayjs(dateTime).format('MMM D, HH:mm')
  }

  const formatDuration = (duration: string) => {
    // Convert PT3H21M format to human readable
    const hours = duration?.match(/(\d+)H/)?.[1] || '0'
    const minutes = duration?.match(/(\d+)M/)?.[1] || '0'
    return `${hours}h ${minutes}m`
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={2}>
          {/* Price and Airline Info */}
          <Grid size={{ xs: 12 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
              <Typography variant="h4" color="primary">
                {Number(offer.price.total).toLocaleString(undefined, {
                  style: 'currency',
                  currency: offer.price.currency,
                })}
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
            <Grid size={{ xs: 12 }} key={index}>
              {index > 0 && <Divider sx={{ my: 2 }} />}

              {itinerary.segments.map((segment, segIdx) => (
                <Box key={segIdx} sx={{ mt: segIdx > 0 ? 2 : 0 }}>
                  <Grid container spacing={2}>
                    {/* Departure */}
                    <Grid size={{ xs: 5 }}>
                      <Stack direction="row" spacing={1}>
                        <FlightTakeoff color="primary" />
                        <Box>
                          <Typography variant="h6">
                            {segment.departure.iataCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(segment.departure.at)}
                          </Typography>
                          {segment.departure.terminal && (
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              Terminal {segment.departure.terminal}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Duration */}
                    <Grid size={{ xs: 2 }}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          {formatDuration(segment.duration)}
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
                    <Grid size={{ xs: 5 }}>
                      <Stack direction="row" spacing={1}>
                        <Box textAlign="right">
                          <Typography variant="h6">
                            {segment.arrival.iataCode}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(segment.arrival.at)}
                          </Typography>
                          {segment.arrival.terminal && (
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              Terminal {segment.arrival.terminal}
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
                  <Typography key={idx} variant="body2" color="text.secondary">
                    {pricing.fareDetailsBySegment[0]?.cabin ?? 'Unknown'} (
                    {pricing.travelerType})
                    {idx < offer.travelerPricings.length - 1 ? ', ' : ''}
                  </Typography>
                ))}
              </Box>
            </Grid>
          ))}

          {/* Additional Flight Information */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Pricing Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Base Price:{' '}
                    {Number(offer.price.base).toLocaleString(undefined, {
                      style: 'currency',
                      currency: offer.price.currency,
                    })}
                  </Typography>
                  {offer.price.taxes?.map((tax, idx) => (
                    <Typography key={idx} variant="body2">
                      Tax ({tax.code}):{' '}
                      {Number(tax.amount).toLocaleString(undefined, {
                        style: 'currency',
                        currency: offer.price.currency,
                      })}
                    </Typography>
                  ))}
                  {offer.pricingOptions.fareType.length > 0 && (
                    <Typography variant="body2">
                      Fare Types: {offer.pricingOptions.fareType.join(', ')}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Included Checked Bags Only:{' '}
                    {offer.pricingOptions.includedCheckedBagsOnly
                      ? 'Yes'
                      : 'No'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Booking Information
                </Typography>
                <Stack spacing={1}>
                  {offer.lastTicketingDate && (
                    <Typography variant="body2">
                      Last Ticketing Date:{' '}
                      {dayjs(offer.lastTicketingDate).format('MMM D, YYYY')}
                    </Typography>
                  )}
                  {offer.lastTicketingDateTime && (
                    <Typography variant="body2">
                      Last Ticketing Time:{' '}
                      {formatDateTime(offer.lastTicketingDateTime)}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    Instant Ticketing Required:{' '}
                    {offer.instantTicketingRequired ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">
                    Non-Homogeneous: {offer.nonHomogeneous ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">
                    One Way: {offer.oneWay ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2">
                    Bookable Seats: {offer.numberOfBookableSeats}
                  </Typography>
                </Stack>
              </Grid>

              {/* Enhanced Traveler Pricing Details */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Traveler Pricing Details
                </Typography>
                {offer.travelerPricings.map((traveler, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary">
                      Traveler {idx + 1} ({traveler.travelerType})
                    </Typography>
                    <Stack spacing={1} sx={{ ml: 2 }}>
                      <Typography variant="body2">
                        Price:{' '}
                        {Number(traveler.price.total).toLocaleString(
                          undefined,
                          { style: 'currency', currency: offer.price.currency }
                        )}
                      </Typography>
                      {traveler.fareDetailsBySegment.map((fare, fareIdx) => (
                        <Box key={fareIdx} sx={{ ml: 2 }}>
                          <Typography variant="body2">
                            Segment {fareIdx + 1}: {fare.cabin} - {fare.class}
                          </Typography>
                          <Stack spacing={0.5} sx={{ ml: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Fare Basis: {fare.fareBasis}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Brand: {fare.brandedFare || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              RBD: {fare.class}
                            </Typography>
                            {fare.includedCheckedBags && (
                              <Typography
                                variant="body2"
                                color="text.secondary">
                                Included bags:{' '}
                                {fare.includedCheckedBags.quantity || 0}
                                {fare.includedCheckedBags.weight &&
                                  ` (${fare.includedCheckedBags.weight}${fare.includedCheckedBags.weightUnit})`}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
