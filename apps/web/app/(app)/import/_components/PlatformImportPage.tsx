'use client'

import dynamic from 'next/dynamic'
import { Message } from './Message'

const PlatformDispatcher = dynamic(
  () => import('./PlatformDispatcher').then((m) => m.PlatformDispatcher),
  { ssr: false, loading: () => <Message>Loading…</Message> },
)

export function PlatformImportPage() {
  return <PlatformDispatcher />
}
