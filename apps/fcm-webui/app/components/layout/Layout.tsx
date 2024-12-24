'use client'

import { Box, CssBaseline, Toolbar } from '@mui/material'
import { ReactNode, useState } from 'react'
import Navbar from './Navbar.tsx'
import Sidebar from './Sidebar.tsx'

const drawerWidth = 240

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navbar */}
      <Navbar onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} />

      {/* Sidebar */}
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} drawerWidth={drawerWidth} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: (theme) => (theme.palette.mode === 'light' ? '#f5f5f5' : theme.palette.background.default),
        }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
