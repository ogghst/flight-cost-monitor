import { ClientConfig } from '@fcm/shared/amadeus/clients'
import { AirportCityClient } from '@fcm/shared/amadeus/clients/airport-city'
import { FlightOfferClient } from '@fcm/shared/amadeus/clients/flight-offer'
import { FlightOfferAdvancedClient } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import {
  FlightEndPoint,
  FlightOffer,
  TravelClass,
} from '@fcm/shared/amadeus/types'
import { config } from 'dotenv'

config()

function formatDateTime(dateTime: string): string {
  return new Date(dateTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  })
}

function formatSegment(
  departure: FlightEndPoint,
  arrival: FlightEndPoint,
  duration: string
) {
  return (
    `${departure.iataCode} (${formatDateTime(departure.at)}) → ` +
    `${arrival.iataCode} (${formatDateTime(arrival.at)}) ` +
    `[${FlightOfferClient.formatDuration(duration)}]`
  )
}

function displayFlightOffer(offer: FlightOffer): void {
  console.log('\n' + '='.repeat(80))
  console.log(`Flight Offer #${offer.id}`)
  console.log('='.repeat(80))

  // Display basic info
  console.log(
    `Price: ${FlightOfferClient.formatPrice(offer.price.total, offer.price.currency)}`
  )
  console.log(`Seats available: ${offer.numberOfBookableSeats}`)
  console.log(`Last ticketing date: ${offer.lastTicketingDate}`)
  console.log(
    `Instant ticketing required: ${offer.instantTicketingRequired ? 'Yes' : 'No'}`
  )

  // Display itineraries
  offer.itineraries.forEach((itinerary, index) => {
    console.log(
      `\nItinerary ${index + 1} (${FlightOfferClient.formatDuration(itinerary.duration)}):`
    )
    console.log('-'.repeat(80))

    itinerary.segments.forEach((segment, segIndex) => {
      console.log(`\nFlight ${segment.carrierCode}${segment.number}:`)
      console.log(
        formatSegment(segment.departure, segment.arrival, segment.duration)
      )

      if (segment.operating) {
        console.log(`Operated by: ${segment.operating.carrierCode}`)
      }

      // Display stops if any
      if (segment.numberOfStops > 0 && segment.stops) {
        console.log('\nStops:')
        segment.stops.forEach((stop) => {
          console.log(
            `  ${stop.iataCode} (${FlightOfferClient.formatDuration(stop.duration)})`
          )
        })
      }
    })
  })

  // Display pricing details
  console.log('\nPricing Details:')
  console.log('-'.repeat(80))
  offer.travelerPricings.forEach((pricing) => {
    console.log(`\nTraveler ${pricing.travelerId} (${pricing.travelerType}):`)
    console.log(`Fare option: ${pricing.fareOption}`)
    console.log(
      `Price: ${FlightOfferClient.formatPrice(pricing.price.total, pricing.price.currency)}`
    )

    pricing.fareDetailsBySegment.forEach((detail) => {
      console.log(`\nSegment ${detail.segmentId}:`)
      console.log(`  Class: ${detail.class} (${detail.cabin})`)
      console.log(`  Fare basis: ${detail.fareBasis}`)
      if (detail.brandedFare) {
        console.log(`  Branded fare: ${detail.brandedFare}`)
      }
      if (detail.includedCheckedBags.quantity) {
        console.log(`  Included bags: ${detail.includedCheckedBags.quantity}`)
      }
      if (detail.includedCheckedBags.weight) {
        console.log(
          `  Bag weight allowance: ${detail.includedCheckedBags.weight}${detail.includedCheckedBags.weightUnit}`
        )
      }
    })
  })
}

async function airportSearch(): Promise<void> {
  try {
    const clientConfig = new ClientConfig({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
    })

    const airportClient = new AirportCityClient(clientConfig)

    console.log('\nSearching for airports containing "YUL" in the name...')
    const response = await airportClient.search({
      keyword: 'YUL',
      subType: ['AIRPORT'],
    })
    console.log('\nSearch results:', JSON.stringify(response.data, null, 2))

    console.log('\nFetching details for ALHR...')
    const location = await airportClient.getById('ALHR')

    console.log('\nLocation details:', JSON.stringify(location, null, 2))
  } catch (error) {
    if (error instanceof Error) {
      console.error('\nError occurred:', error.message)
      if ('response' in error) {
        console.error('API Response:', JSON.stringify(error.response, null, 2))
      }
      // Log the full error object for debugging
      console.error('\nFull error details:', error)
    } else {
      console.error('\nUnknown error:', error)
    }
    throw error // Re-throw to handle in the main execution
  }
}

async function simpleSearch(): Promise<void> {
  try {
    const clientConfig = new ClientConfig({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
    })

    const flightClient = new FlightOfferClient(clientConfig)

    console.log('\nPerforming simple search...')
    const response = await flightClient.searchFlightOffers({
      originLocationCode: 'LON',
      destinationLocationCode: 'NYC',
      departureDate: '2025-07-01',
      adults: 1,
      maxResults: 3,
      travelClass: 'BUSINESS' as TravelClass,
      nonStop: true,
      currencyCode: 'USD',
    })

    console.log(`\nFound ${response.data.length} flight offers:`)
    response.data.forEach((offer) => displayFlightOffer(offer))
  } catch (error) {
    console.error('Error in simple search:', error)
    throw error
  }
}

async function advancedSearch(): Promise<void> {
  try {
    const clientConfig = new ClientConfig({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
    })

    const flightClientAdvanced = new FlightOfferAdvancedClient(clientConfig)

    console.log('\nPerforming advanced search...')
    const response = await flightClientAdvanced.searchFlightOffersAdvanced({
      currencyCode: 'USD',
      originDestinations: [
        {
          id: '1',
          originLocationCode: 'LON',
          destinationLocationCode: 'NYC',
          departureDateTimeRange: {
            date: '2025-07-01',
            time: '10:00:00',
          },
        },
        {
          id: '2',
          originLocationCode: 'NYC',
          destinationLocationCode: 'LON',
          departureDateTimeRange: {
            date: '2025-07-15',
            time: '17:00:00',
          },
        },
      ],
      travelers: [
        {
          id: '1',
          travelerType: 'ADULT',
        },
        {
          id: '2',
          travelerType: 'CHILD',
        },
      ],
      sources: ['GDS'],
      searchCriteria: {
        maxFlightOffers: 3,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: TravelClass.BUSINESS,
              coverage: 'ALL_SEGMENTS',
              originDestinationIds: ['1', '2'],
            },
          ],
          carrierRestrictions: {
            excludedCarrierCodes: ['NK', 'FR'], // Exclude certain budget airlines
          },
          connectionRestriction: {
            maxNumberOfConnections: 1,
            nonStopPreferred: true,
          },
        },
        pricingOptions: {
          includedCheckedBagsOnly: true,
        },
      },
    })

    console.log(`\nFound ${response.data.length} flight offers:`)
    response.data.forEach((offer) => displayFlightOffer(offer))

    // Display dictionary information if available
    if (response.dictionaries) {
      console.log('\nCarrier Information:')
      Object.entries(response.dictionaries.carriers).forEach(([code, name]) => {
        console.log(`${code}: ${name}`)
      })
    }
  } catch (error) {
    console.error('Error in advanced search:', error)
    throw error
  }
}

async function runExamples(): Promise<void> {
  try {
    // Validate environment variables
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      throw new Error(
        'Missing required environment variables AMADEUS_CLIENT_ID and/or AMADEUS_CLIENT_SECRET'
      )
    }

    // Run airport search example
    airportSearch()

    // Run simple search example
    await simpleSearch()

    // Run advanced search example
    await advancedSearch()
  } catch (error) {
    console.error('\nError running examples:', error)
    process.exit(1)
  }
}

// Run the examples
runExamples()
