'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
import {
  DateRange,
  FlightTakeoff,
  Home,
  Search,
  Settings,
} from '@mui/icons-material'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material'
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
  { text: 'My Flights', icon: <FlightTakeoff />, path: '/flights' },
  { text: 'Schedule', icon: <DateRange />, path: '/schedule' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
]

export default function Sidebar({ open, onClose, drawerWidth }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useIsMobile()
  const pathname = usePathname()

  const drawerContent = (
    <List>
      {menuItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component="a"
            href={item.path}
            selected={pathname === item.path}
            onClick={isMobile ? onClose : undefined}>
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
