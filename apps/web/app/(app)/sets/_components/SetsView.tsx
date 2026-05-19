import type { CuratedSet } from '@lingua-hub/vocab'

type Props = {
  sets: CuratedSet.CuratedSet[]
}

export function SetsView({ sets }: Props) {
  if (sets.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No sets available yet.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sets.map((set) => (
        <div
          key={set.id}
          className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium"
        >
          {set.title}
        </div>
      ))}
    </div>
  )
}
