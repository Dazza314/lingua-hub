import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

type Props = {
  title: string
}

export function ScopedSessionChip({ title }: Props) {
  return (
    <div className="inline-flex h-8 items-center gap-1 rounded-4xl bg-muted pl-3 pr-1 text-sm">
      <span className="text-muted-foreground">Studying:</span>
      <span className="max-w-48 truncate font-medium">{title}</span>
      <Link
        href="/exercise"
        aria-label="Exit scoped study session"
        className="ml-0.5 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
      </Link>
    </div>
  )
}
