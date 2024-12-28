'use client'

import theme from '@/lib/theme'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import dayjs from 'dayjs'
import 'dayjs/locale/en-gb'
import 'dayjs/locale/it'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

// Initialize dayjs plugins
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.locale('it')

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  // Get browser locale, fallback to 'en' if not available
  const browserLocale =
    typeof window !== 'undefined' ? navigator.language : 'en'

  // Set dayjs locale based on browser setting
  dayjs.locale(browserLocale)

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={browserLocale}>
            <CssBaseline />
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
            <CssBaseline />
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
