import { SignOutButton } from '@/components/SignOutButton'

export function NavBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <span className="font-semibold">Lingua Hub</span>
      <SignOutButton />
    </header>
  )
}
