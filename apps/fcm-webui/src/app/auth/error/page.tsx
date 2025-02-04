'use client'
import { Box, Button, Container, Typography } from '@mui/material'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <Typography component="h1" variant="h5" color="error">
        Authentication Error
      </Typography>
      <Typography sx={{ mt: 2, mb: 4 }}>
        {error === 'Configuration' &&
          'There is a problem with the server configuration.'}
        {error === 'AccessDenied' && 'You do not have permission to sign in.'}
        {error === 'Verification' && 'The sign in link is no longer valid.'}
        {!error && 'An unknown error occurred.'}
      </Typography>
      <Button href="/auth/signin" variant="contained">
        Back to Sign In
      </Button>
    </Box>
  )
}

export default function AuthError() {
  return (
    <Container maxWidth="sm">
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorContent />
      </Suspense>
    </Container>
  )
}
