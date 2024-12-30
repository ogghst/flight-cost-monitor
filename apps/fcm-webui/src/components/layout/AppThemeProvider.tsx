'use client'
import { CssBaseline } from '@mui/material'
import {
  adaptV4Theme,
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material/styles'
import { createContext, useContext, useMemo, useState } from 'react'

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
})

export function useColorMode() {
  return useContext(ColorModeContext)
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
    }),
    []
  )

  const theme = useMemo(
    () =>
      createTheme(
        adaptV4Theme({
          palette: {
            mode,
            ...(mode === 'light'
              ? {
                  // Light mode colors
                  primary: {
                    main: '#1976d2',
                  },
                  secondary: {
                    main: '#dc004e',
                  },
                  background: {
                    default: '#f5f5f5',
                    paper: '#ffffff',
                  },
                }
              : {
                  // Dark mode colors
                  primary: {
                    main: '#90caf9',
                  },
                  secondary: {
                    main: '#f48fb1',
                  },
                  background: {
                    default: '#121212',
                    paper: '#1e1e1e',
                  },
                }),
          },
        })
      ),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </ColorModeContext.Provider>
  )
}
