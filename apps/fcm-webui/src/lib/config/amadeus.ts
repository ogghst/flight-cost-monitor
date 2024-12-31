import { ClientConfig } from 'node_modules/@fcm/shared/dist/amadeus/clients/base'

export const amadeusConfig: ClientConfig = {
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  baseUrl: process.env.AMADEUS_FLIGHT_OFFER_API_URL!,
  authUrl: process.env.AMADEUS_AUTH_URL!,
  timeout: Number(process.env.AMADEUS_TIMEOUT) || 60000,
}
