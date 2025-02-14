'use client'

import { SearchFormProvider } from '@/components/context/SearchFormContext'
import { NotificationProvider } from '@/components/NotificationProvider'
import theme from '@/lib/theme'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/en-gb'
import 'dayjs/locale/it'
import 'dayjs/locale/it-ch'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { SessionProvider } from 'next-auth/react'
import { useMemo, useState } from 'react'

// Initialize dayjs plugins
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

function normalizeLocale(locale: string): string {
  const lowercaseLocale = locale.toLowerCase()
  const localeMap: Record<string, string> = {
    'en-us': 'en',
    'en-gb': 'en-gb',
    'it-it': 'it',
    'it-ch': 'it-ch',
  }
  const baseLocale = lowercaseLocale.split('-')[0]
  return localeMap[lowercaseLocale] || baseLocale || 'en'
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  const adapterLocale = useMemo(() => {
    const browserLocale =
      typeof window !== 'undefined' ? navigator.language : 'en'
    return normalizeLocale(browserLocale)
  }, [])

  dayjs.locale(adapterLocale)

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={adapterLocale}>
            <SearchFormProvider>
              <NotificationProvider>
                <CssBaseline />
                {children}
                <ReactQueryDevtools initialIsOpen={false} />
              </NotificationProvider>
            </SearchFormProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}