'use client'

import { Button } from '@/components/ui/button'
import type { Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { useState, useTransition } from 'react'
import {
  generateExerciseAction,
  type GenerateExerciseResult,
} from '../_actions/generate-exercise'
import { EvaluationCard } from './EvaluationCard'
import { ExerciseCard } from './ExerciseCard'
import { TranslationForm } from './TranslationForm'
import { useEvaluateExercise } from './use-evaluate-exercise'

type Props = {
  initialExercise: Exercise.Exercise
}

export function ExerciseView({ initialExercise }: Props) {
  const [result, setResult] = useState<Awaited<GenerateExerciseResult>>(() =>
    Result.succeed(initialExercise),
  )
  const [isPending, startTransition] = useTransition()
  const [userTranslation, setUserTranslation] = useState<string | null>(null)
  const { state: evaluationState, evaluate } = useEvaluateExercise()

  function handleSubmit(translation: string) {
    if (Result.isFailure(result)) {
      return
    }
    setUserTranslation(translation)
    evaluate(result.value, translation)
  }

  function handleNext() {
    setUserTranslation(null)
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
          onClick={handleNext}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <ExerciseCard exercise={result.value} />
      {userTranslation === null ? (
        <TranslationForm onSubmit={handleSubmit} />
      ) : (
        <>
          <p className="text-sm">{userTranslation}</p>
          {(evaluationState.status === 'streaming' ||
            evaluationState.status === 'complete') && (
            <EvaluationCard
              evaluation={
                evaluationState.status === 'streaming'
                  ? evaluationState.partial
                  : evaluationState.evaluation
              }
            />
          )}
          {evaluationState.status === 'error' && (
            <p className="text-muted-foreground text-sm">
              {evaluationState.error.message}
            </p>
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={handleNext}
            disabled={evaluationState.status === 'streaming'}
          >
            Next
          </Button>
        </>
      )}
    </div>
  )
}
