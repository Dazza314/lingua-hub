'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function LoginButton() {
  const router = useRouter()

  useEffect(() => {
    let removeListener: (() => void) | undefined

    const setupDeepLinkHandler = async () => {
      const { Capacitor } = await import('@capacitor/core')
      if (!Capacitor.isNativePlatform()) {
        return
      }

      const { App } = await import('@capacitor/app')
      const { Browser } = await import('@capacitor/browser')

      const handle = await App.addListener('appUrlOpen', async ({ url }) => {
        if (!url.startsWith('com.linguahub.app://login-callback')) {
          return
        }

        const code = new URL(url).searchParams.get('code')
        if (code) {
          const supabase = createClient()
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            await Browser.close()
            router.replace('/')
          }
        }
      })

      removeListener = () => handle.remove()
    }

    setupDeepLinkHandler()
    return () => removeListener?.()
  }, [router])

  const handleLogin = async () => {
    const supabase = createClient()
    const { Capacitor } = await import('@capacitor/core')

    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import('@capacitor/browser')
      const { data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.linguahub.app://login-callback',
          skipBrowserRedirect: true,
        },
      })
      if (data.url) {
        await Browser.open({ url: data.url })
      }
    } else {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
    }
  }

  return <Button onClick={handleLogin}>Sign in with Google</Button>
}
