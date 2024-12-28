'use client'

import { useAuth } from '@/hooks/auth/useAuth'
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth()

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}>
          Flight Cost Monitor
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} href="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} href="/flights/search">
                Search Flights
              </Button>
            </>
          )}
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                component={Link}
                href="/profile"
                sx={{ ml: 2 }}>
                {user?.email}
              </Button>
              <Button color="inherit" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" href="/auth/signin">
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
