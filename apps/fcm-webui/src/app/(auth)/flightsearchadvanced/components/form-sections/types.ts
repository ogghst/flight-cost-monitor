import { FlightOffersAdvancedSearchRequest } from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import { Control } from 'react-hook-form'

export interface FormSectionProps {
    control: Control<FlightOffersAdvancedSearchRequest>
    isLoading?: boolean
}
