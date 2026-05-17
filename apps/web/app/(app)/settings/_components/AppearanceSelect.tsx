'use client'

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const

export function AppearanceSelect() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex gap-1.5">
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-colors',
            theme === value
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
