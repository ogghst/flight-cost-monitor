import { FlightOfferAdvancedSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { Control } from 'react-hook-form'

export interface FormSectionProps {
  control: Control<FlightOfferAdvancedSearchRequest>
  isLoading?: boolean
}
