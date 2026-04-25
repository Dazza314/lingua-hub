'use client'

import { Capacitor } from '@capacitor/core'
import dynamic from 'next/dynamic'
import { Message } from './Message'

const AndroidImportPage = dynamic(() =>
  import('./AndroidImportPage').then((m) => m.AndroidImportPage),
)

export function PlatformDispatcher() {
  if (Capacitor.getPlatform() === 'android') {
    return <AndroidImportPage />
  }
  return <Message>Import is only available on Android.</Message>
}
