'use client'

import { ThemeProvider } from '@mui/material/styles'
import { Layout } from './components/layout'
import theme from './components/layout/theme'
import { Provider } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <ThemeProvider theme={theme}>
            <Layout>{children}</Layout>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  )
}
