'use client'

import { useAuth } from '@/hooks/auth/useAuth'
import { useIsMobile } from '@/hooks/useIsMobile'
import theme from '@/lib/theme'
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  onMenuClick: () => void
  drawerWidth: number
}

export default function Navbar({ onMenuClick, drawerWidth }: NavbarProps) {
  const isMobile = useIsMobile()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { user, isAuthenticated, signOut } = useAuth()
  const { data: session } = useSession()
  const router = useRouter()

  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleProfileClick = () => {
    handleProfileMenuClose()
    router.push('/profile')
  }

  // Get user display info
  const userImage = session?.user?.image
  const userName = session?.user?.name || session?.user?.email || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isAuthenticated && !isMobile ? `calc(100% - ${drawerWidth}px)` : '100%',
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
            sx={{ mr: 2 }}
            size="large">
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
                {userImage ? (
                  <Avatar
                    alt={userName}
                    src={userImage}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {userInitial}
                  </Avatar>
                )}
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
                <MenuItem onClick={handleProfileClick}>
                  <Typography>{userName}</Typography>
                </MenuItem>
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
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