'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PencilEdit01Icon,
  BookOpen01Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/exercise', label: 'Practice', icon: PencilEdit01Icon },
  { href: '/sets', label: 'Sets', icon: BookOpen01Icon },
  { href: '/settings', label: 'Settings', icon: Settings01Icon },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:sticky md:top-0 md:h-screen md:border-r md:border-border">
        <div className="flex flex-col gap-1 p-4">
          <span className="px-2 pb-4 mb-2 border-b border-border font-semibold text-sm">
            Lingua Hub
          </span>
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={18}
                  strokeWidth={active ? 2 : 1.5}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-background md:hidden">
        <div className="flex pb-[env(safe-area-inset-bottom)]">
          {navItems.map(({ href, label, icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                  active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={22}
                  strokeWidth={active ? 2 : 1.5}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
