'use client'

import { Box, CssBaseline, Toolbar } from '@mui/material'
import { ReactNode, useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useAuth } from '@/hooks/auth/useAuth'

const drawerWidth = 240

export default function FcmLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navbar */}
      <Navbar onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} />

      {isAuthenticated && (
        <>
          {/* Sidebar */}
          <Sidebar
            open={mobileOpen}
            onClose={handleDrawerToggle}
            drawerWidth={drawerWidth}
          />
        </>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: (theme: any) =>
            theme.palette.mode === 'light'
              ? '#f5f5f5'
              : theme.palette.background.default,
        }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
