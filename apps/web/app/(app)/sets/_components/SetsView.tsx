'use client'

import { deselectSet, selectSet } from '@/app/actions'
import { cn } from '@/lib/utils'
import type { CuratedSet } from '@lingua-hub/vocab'
import { useOptimistic, useTransition } from 'react'

type Props = {
  sets: CuratedSet.CuratedSet[]
  selectedSetIds: string[]
}

export function SetsView({ sets, selectedSetIds }: Props) {
  const [optimisticSelectedIds, updateOptimistic] = useOptimistic(
    new Set(selectedSetIds),
    (state, { id, selected }: { id: string; selected: boolean }) => {
      const next = new Set(state)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    },
  )

  const [, startTransition] = useTransition()

  function handleToggle(setId: string) {
    const isSelected = optimisticSelectedIds.has(setId)
    startTransition(async () => {
      updateOptimistic({ id: setId, selected: !isSelected })
      if (isSelected) {
        await deselectSet(setId)
      } else {
        await selectSet(setId)
      }
    })
  }

  if (sets.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No sets available yet.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sets.map((set) => {
        const isSelected = optimisticSelectedIds.has(set.id)
        return (
          <button
            key={set.id}
            onClick={() => handleToggle(set.id)}
            className={cn(
              'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
              isSelected
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {set.title}
          </button>
        )
      })}
    </div>
  )
}
