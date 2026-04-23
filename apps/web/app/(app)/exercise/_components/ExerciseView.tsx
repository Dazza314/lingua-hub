'use client'

import type { Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { useState, useTransition } from 'react'
import {
  generateExerciseAction,
  type GenerateExerciseResult,
} from '../_actions/generate-exercise'
import { ExerciseCard } from './ExerciseCard'
import { TranslationForm } from './TranslationForm'

type Props = {
  initialExercise: Exercise.Exercise
}

export function ExerciseView({ initialExercise }: Props) {
  const [result, setResult] = useState<Awaited<GenerateExerciseResult>>(() =>
    Result.succeed(initialExercise),
  )
  const [isPending, startTransition] = useTransition()

  function fetchNext() {
    startTransition(async () => {
      const next = await generateExerciseAction()
      setResult(next)
    })
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">Generating exercise…</p>
      </div>
    )
  }

  if (Result.isFailure(result)) {
    if (result.error.type === 'EmptyVocabError') {
      return (
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-muted-foreground text-center text-sm">
            No vocabulary synced yet. Open AnkiDroid and sync your deck.
          </p>
        </div>
      )
    }
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground text-center text-sm">
          {result.error.message}
        </p>
        <button
          className="text-primary text-sm underline-offset-4 hover:underline"
          onClick={fetchNext}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <ExerciseCard exercise={result.value} />
      <TranslationForm onNextAction={(_answer) => fetchNext()} />
    </div>
  )
}
