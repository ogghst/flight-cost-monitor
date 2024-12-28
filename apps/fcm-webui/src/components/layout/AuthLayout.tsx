'use client'

import { useAuth } from '@/hooks/auth/useAuth'
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flight Cost Monitor
          </Typography>
          {isAuthenticated ? (
            <>
              <Typography sx={{ mr: 2 }}>{user?.email}</Typography>
              <Button color="inherit" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" href="/auth/signin">
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  )
}
