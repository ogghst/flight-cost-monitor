'use client'

import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          textAlign: 'center',
          borderTop: 4,
          borderColor: 'error.main',
        }}>
        <Typography variant="h5" color="error" gutterBottom>
          Something went wrong
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error.message}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={resetErrorBoundary}
            sx={{ mr: 2 }}>
            Try again
          </Button>
          <Button variant="outlined" href="/">
            Go to Homepage
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  onReset?: () => void
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={onReset}>
        <Component {...props} />
      </ReactErrorBoundary>
    )
  }
}
