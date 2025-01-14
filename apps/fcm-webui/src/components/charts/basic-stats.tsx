import { Box, Grid, Typography } from '@mui/material'

interface BasicStatsProps {
  totalResults: number
  avgPrice: number
  minPrice: number
  maxPrice: number
}

export function BasicStats({ totalResults, avgPrice, minPrice, maxPrice }: BasicStatsProps) {
  return (
    <Box>
      <Typography variant="h5" className="mb-4">Basic Statistics</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="p-4 bg-gray-50 rounded-lg">
            <Typography variant="subtitle2">Total Results</Typography>
            <Typography variant="h4">{totalResults}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="p-4 bg-gray-50 rounded-lg">
            <Typography variant="subtitle2">Average Price</Typography>
            <Typography variant="h4">${avgPrice.toFixed(2)}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="p-4 bg-gray-50 rounded-lg">
            <Typography variant="subtitle2">Min Price</Typography>
            <Typography variant="h4">${minPrice.toFixed(2)}</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="p-4 bg-gray-50 rounded-lg">
            <Typography variant="subtitle2">Max Price</Typography>
            <Typography variant="h4">${maxPrice.toFixed(2)}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}