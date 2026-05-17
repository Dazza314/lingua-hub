import { SignOutButton } from '@/components/SignOutButton'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { AppearanceSelect } from './_components/AppearanceSelect'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  const name: string = user?.user_metadata?.full_name ?? user?.email ?? ''
  const email: string = user?.email ?? ''
  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="px-4 py-6 max-w-lg">
      <h1 className="mb-1 text-lg font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Account and preferences.
      </p>

      <div className="mb-5">
        <p className="mb-2 px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Account
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {initials}
              </div>
            )}
            <div>
              <p className="text-sm font-medium leading-tight">{name}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {email}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Sign out</span>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Preferences
        </p>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm">Language</span>
            <span className="text-xs text-muted-foreground">Japanese</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm">Appearance</span>
            <AppearanceSelect />
          </div>
        </div>
      </div>
    </div>
  )
}
