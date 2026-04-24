import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'

export function NavBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <span className="font-semibold">Lingua Hub</span>
      <nav className="flex items-center gap-4">
        <Link href="/import" className="text-sm text-muted-foreground hover:text-foreground">
          Import
        </Link>
        <SignOutButton />
      </nav>
    </header>
  )
}
