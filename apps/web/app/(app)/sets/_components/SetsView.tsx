import type { CuratedSet } from '@lingua-hub/vocab'
import Link from 'next/link'

type Props = {
  sets: CuratedSet.CuratedSet[]
}

export function SetsView({ sets }: Props) {
  if (sets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No sets available yet.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sets.map((set) => (
        <Link
          key={set.id}
          href={`/sets/${set.id}`}
          className="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {set.category}
          </p>
          <p className="mb-2 font-medium">{set.title}</p>
          <p className="text-xs text-muted-foreground">
            {set.vocabCount} vocab · {set.grammarCount} grammar
          </p>
        </Link>
      ))}
    </div>
  )
}
