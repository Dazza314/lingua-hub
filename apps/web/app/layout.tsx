import { ThemeProvider } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'
import { SerwistProvider } from '@serwist/turbopack/react'
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
  const themed = <ThemeProvider>{children}</ThemeProvider>
  return (
    <html
      lang="en"
      className={cn('font-sans', figtree.variable)}
      suppressHydrationWarning
    >
      <body>
        {process.env.NODE_ENV === 'production' ? (
          <SerwistProvider swUrl="/serwist/sw.js">{themed}</SerwistProvider>
        ) : (
          themed
        )}
      </body>
    </html>
  )
}
