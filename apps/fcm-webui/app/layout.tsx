'use client'

import { ThemeProvider } from '@mui/material/styles'
import { Layout } from './components/layout'
import theme from './components/layout/theme'

interface RootLayoutProps {
    children: React.ReactNode // Add this type
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider theme={theme}>
                    <Layout>{children}</Layout>
                </ThemeProvider>
            </body>
        </html>
    )
}
