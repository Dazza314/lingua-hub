import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lingua Hub',
  description: 'Language learning powered by your Anki vocabulary',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
