import { Suspense } from 'react'
import { Box, Container, Typography, CircularProgress } from '@mui/material'
import StatsContent from './stats-content'

export const metadata = {
  title: 'Flight Search Statistics',
}

export default async function StatsPage() {
  return (
    <Container maxWidth="xl">
      <Box className="py-8">
        <Typography variant="h4" className="mb-6">Flight Search Statistics</Typography>
        <Suspense fallback={
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        }>
          <StatsContent />
        </Suspense>
      </Box>
    </Container>
  )
}
