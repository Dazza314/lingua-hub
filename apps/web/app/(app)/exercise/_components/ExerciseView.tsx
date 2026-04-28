'use client'

import { Button } from '@/components/ui/button'
import { motionTokens, transitions } from '@/lib/animations'
import type { Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { AnimatePresence, motion } from 'framer-motion'
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
      <ExerciseCard exercise={result.value} isLoading={isPending} />
      <AnimatePresence mode="wait">
        {userTranslation === null ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: motionTokens.distance.sm }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -motionTokens.distance.sm }}
            transition={transitions.ease}
          >
            <TranslationForm onSubmit={handleSubmit} />
          </motion.div>
        ) : (
          <motion.div
            key="evaluated"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: motionTokens.distance.sm }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -motionTokens.distance.sm }}
            transition={transitions.ease}
          >
            <div className="bg-background border-input rounded-xl border px-4 py-3">
              <p className="text-sm">{userTranslation}</p>
            </div>
            {(evaluationState.status === 'streaming' ||
              evaluationState.status === 'complete') && (
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitions.ease}
              >
                <EvaluationCard
                  evaluation={
                    evaluationState.status === 'streaming'
                      ? evaluationState.partial
                      : evaluationState.evaluation
                  }
                />
              </motion.div>
            )}
            {evaluationState.status === 'error' && (
              <p className="text-muted-foreground text-sm">
                {evaluationState.error.message}
              </p>
            )}
            <Button
              ref={(ref) => ref?.focus()}
              size="lg"
              className="w-full"
              onClick={handleNext}
              disabled={evaluationState.status === 'streaming'}
            >
              Next
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
