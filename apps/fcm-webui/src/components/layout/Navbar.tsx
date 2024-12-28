'use client'

import { useAuth } from '@/hooks/auth/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'
import theme from '@/lib/theme'
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'

interface NavbarProps {
  onMenuClick: () => void
  drawerWidth: number
}

export default function Navbar({ onMenuClick, drawerWidth }: NavbarProps) {
  const isMobile = useIsMobile()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, isAuthenticated, signOut } = useAuth()

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width:
          isAuthenticated && !isMobile
            ? `calc(100% - ${drawerWidth}px)`
            : '100%',
        ml: isAuthenticated && !isMobile ? `${drawerWidth}px` : 0,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
      <Toolbar>
        {isAuthenticated && isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Flight Cost Monitor
        </Typography>

        <Box>
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                color="inherit">
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}>
                <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleProfileMenuClose}>My account</MenuItem>
                <MenuItem onClick={() => signOut()}>Logout</MenuItem>
              </Menu>
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
