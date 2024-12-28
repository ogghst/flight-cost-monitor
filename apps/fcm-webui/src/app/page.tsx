import { Flight, Search, TrendingUp } from '@mui/icons-material'
import { Box, Button, Container, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import Link from 'next/link'

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Flight Cost Monitor
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          color="text.secondary"
          paragraph>
          Track and analyze flight prices to find the best deals for your travel
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            size="large"
            sx={{ minWidth: 200 }}>
            Get Started
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid component="div">
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Search sx={{ fontSize: 48, mb: 2 }} color="primary" />
            <Typography variant="h6" gutterBottom>
              Search Flights
            </Typography>
            <Typography color="text.secondary">
              Search through multiple airlines and find the best options for
              your journey
            </Typography>
          </Box>
        </Grid>
        <Grid component="div">
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <TrendingUp sx={{ fontSize: 48, mb: 2 }} color="primary" />
            <Typography variant="h6" gutterBottom>
              Track Prices
            </Typography>
            <Typography color="text.secondary">
              Monitor price changes and get notified when prices drop
            </Typography>
          </Box>
        </Grid>
        <Grid>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Flight sx={{ fontSize: 48, mb: 2 }} color="primary" />
            <Typography variant="h6" gutterBottom>
              Book Flights
            </Typography>
            <Typography color="text.secondary">
              Book your flights directly through our integrated booking system
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}
