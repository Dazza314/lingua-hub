import { NavBar } from '@/components/NavBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  )
}
