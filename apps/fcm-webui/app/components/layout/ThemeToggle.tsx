import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { IconButton, useTheme } from '@mui/material'
import { useColorMode } from './AppThemeProvider'

export default function ThemeToggle() {
  const theme = useTheme()
  const { toggleColorMode } = useColorMode()

  return (
    <IconButton onClick={toggleColorMode} color="inherit">
      {theme.palette.mode === 'dark' ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </IconButton>
  )
}
