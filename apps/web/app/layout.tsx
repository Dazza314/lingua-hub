import { ThemeProvider } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Lingua Hub',
  description: 'Language learning powered by your Anki vocabulary',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cn('font-sans', figtree.variable)}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
