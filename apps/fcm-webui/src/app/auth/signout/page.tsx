'use client'

import { Box, Button, Container, Typography } from '@mui/material'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/' })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
        <Typography component="h1" variant="h5">
          Signing out...
        </Typography>
        <Typography color="text.secondary">
          You will be redirected to the home page in a few seconds.
        </Typography>
        <Button
          variant="contained"
          onClick={() => signOut({ callbackUrl: '/' })}
          sx={{ mt: 2 }}>
          Sign out now
        </Button>
        <Button variant="text" onClick={() => router.back()}>
          Cancel
        </Button>
      </Box>
    </Container>
  )
}