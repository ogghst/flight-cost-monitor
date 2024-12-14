/* eslint-disable react/function-component-definition */

'use client';

import { Box, CssBaseline, Toolbar } from '@mui/material';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const drawerWidth = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navbar */}
      <Navbar onMenuClick={handleDrawerToggle} drawerWidth={drawerWidth} />

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? '#f5f5f5'
              : theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Adds spacing below the navbar */}
        {children}
      </Box>
    </Box>
  );
}
