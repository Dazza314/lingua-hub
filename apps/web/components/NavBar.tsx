import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'

export function NavBar() {
  return (
    <header className="border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4">
        <span className="font-semibold">Lingua Hub</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/import"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Import
          </Link>
          <SignOutButton />
        </nav>
      </div>
    </header>
  )
}
