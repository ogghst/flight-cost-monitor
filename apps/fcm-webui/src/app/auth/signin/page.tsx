'use client'
import { GitHub } from '@mui/icons-material'
import { Box, Button, Container, Typography } from '@mui/material'
import { signIn } from 'next-auth/react'

export default function SignIn() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            startIcon={<GitHub />}
            onClick={() => signIn('github', { callbackUrl: '/' })}>
            Sign in with GitHub
          </Button>
        </Box>
      </Box>
    </Container>
  )
}