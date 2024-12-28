'use client'

import { Box, Card, CardContent, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material'
import { Controller } from 'react-hook-form'
import { FormSectionProps } from './types'

export function PricingOptionsSection({ control, isLoading }: FormSectionProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Pricing Options</Typography>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Stack>
              <Controller
                name="searchCriteria.pricingOptions.includedCheckedBagsOnly"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Checked Bags Included Only" />}
              />

              <Controller
                name="searchCriteria.pricingOptions.refundableFare"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Refundable Fares Only" />}
              />
            </Stack>

            <Stack>
              <Controller
                name="searchCriteria.pricingOptions.noRestrictionFare"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="No Restrictions" />}
              />

              <Controller
                name="searchCriteria.pricingOptions.noPenaltyFare"
                control={control}
                defaultValue={false}
                render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked) ?? false} disabled={isLoading} />} label="No Change Penalty" />}
              />
            </Stack>
          </Box>

          <Typography variant="subtitle1">Additional Information</Typography>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: '1fr 1fr',
            }}
            gap={3}>
            <Controller
              name="searchCriteria.additionalInformation.chargeableCheckedBags"
              control={control}
              defaultValue={false}
              render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked) ?? false} disabled={isLoading} />} label="Show Baggage Fees" />}
            />

            <Controller
              name="searchCriteria.additionalInformation.brandedFares"
              control={control}
              defaultValue={false}
              render={({ field }) => <FormControlLabel control={<Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked ?? false)} disabled={isLoading} />} label="Show Branded Fares" />}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
