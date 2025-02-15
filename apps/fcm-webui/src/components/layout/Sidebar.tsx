'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
import { DateRange, Home, MonitorHeart, Search } from '@mui/icons-material'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  open: boolean
  onClose: () => void
  drawerWidth: number
}

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Flight Search', icon: <Search />, path: '/flightsearch' },
  {
    text: 'Flight Search Advanced',
    icon: <Search />,
    path: '/flightsearchadvanced',
  },
  { text: 'Scheduler', icon: <DateRange />, path: '/scheduler' },
  { text: 'Monitor', icon: <MonitorHeart />, path: '/monitoring' },
]

export default function Sidebar({ open, onClose, drawerWidth }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const pathname = usePathname()

  const handleClick = () => {
    if (isMobile) {
      onClose()
    }
  }

  const drawerContent = (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component={Link}
            href={{ pathname: item.path }}
            selected={pathname === item.path}
            onClick={handleClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}>
      {drawerContent}
    </Drawer>
  )
}
