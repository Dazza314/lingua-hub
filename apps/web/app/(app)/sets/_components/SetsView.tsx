'use client'

import { ExercisePolicy } from '@lingua-hub/exercise'
import type { CuratedSet } from '@lingua-hub/vocab'
import Link from 'next/link'
import { PracticeTypeIndicator } from './PracticeTypeIndicator'

type Props = {
  sets: CuratedSet.CuratedSet[]
  policy: ExercisePolicy.ExercisePolicy
}

export function SetsView({ sets, policy }: Props) {
  if (sets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No sets available yet.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {sets.map((set) => {
        const hasVocab = policy.vocab.setIds.includes(set.id)
        const hasGrammar = policy.grammar.setIds.includes(set.id)
        return (
          <Link
            key={set.id}
            href={`/sets/${set.id}`}
            className="relative rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <p className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              {set.category}
            </p>
            <p className="mb-2 font-medium">{set.title}</p>
            <p className="text-xs text-muted-foreground">
              {set.vocabCount} vocab · {set.grammarCount} grammar
            </p>
            {(hasVocab || hasGrammar) && (
              <div className="absolute right-4 top-3 flex items-center gap-1">
                {hasVocab && <PracticeTypeIndicator type="vocab" />}
                {hasGrammar && <PracticeTypeIndicator type="grammar" />}
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
