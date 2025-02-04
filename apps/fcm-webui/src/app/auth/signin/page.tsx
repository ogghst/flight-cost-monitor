'use client'

import LoginForm from '@/components/auth/LoginForm'
import { GitHub } from '@mui/icons-material'
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material'
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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign in to FCM
          </Typography>
          <Box sx={{ mt: 1, width: '100%' }}>
            <LoginForm />
            <Divider sx={{ my: 2 }}>OR</Divider>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 1, mb: 2 }}
              startIcon={<GitHub />}
              onClick={() => signIn('github', { callbackUrl: '/' })}>
              Sign in with GitHub
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
