import { AppNav } from '@/components/AppNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AppNav />
      <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="mx-auto w-full max-w-2xl">{children}</div>
      </main>
    </div>
  )
}
