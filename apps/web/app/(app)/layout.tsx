import { AppNav } from '@/components/AppNav'
import { QueryProvider } from '@/components/QueryProvider'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <AppNav />
        <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
          <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              {children}
            </div>
          </div>
        </main>
      </div>
    </QueryProvider>
  )
}
