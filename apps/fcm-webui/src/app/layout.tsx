import FcmLayout from '@/components/layout/FcmLayout'
import { Providers } from '@/components/providers'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <FcmLayout>{children}</FcmLayout>
        </Providers>
      </body>
    </html>
  )
}
