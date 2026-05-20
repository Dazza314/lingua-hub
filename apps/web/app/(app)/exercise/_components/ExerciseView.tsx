'use client'

import { saveExercisePolicy } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { motionTokens, transitions } from '@/lib/animations'
import { Exercise, ExercisePolicy } from '@lingua-hub/exercise'
import { CuratedSetId } from '@lingua-hub/vocab'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { EvaluationCard } from './EvaluationCard'
import { ExerciseCard } from './ExerciseCard'
import { PolicyEditor } from './PolicyEditor'
import { PracticeHeader } from './PracticeHeader'
import { TranslationForm } from './TranslationForm'
import { useEvaluateExercise } from './use-evaluate-exercise'
import { useGenerateExercise } from './use-generate-exercise'

type Set = { id: CuratedSetId.CuratedSetId; title: string }

type Props = {
  initialPolicy: ExercisePolicy.ExercisePolicy
  sets: Set[]
}

export function ExerciseView({ initialPolicy, sets }: Props) {
  const { state: generateState, generate } = useGenerateExercise()
  const { state: evaluationState, evaluate } = useEvaluateExercise()
  const [userTranslation, setUserTranslation] = useState<string | null>(null)
  const [policy, setPolicy] =
    useState<ExercisePolicy.ExercisePolicy>(initialPolicy)
  const translationRef = useRef<HTMLTextAreaElement>(null)
  const savePromiseRef = useRef<Promise<unknown> | null>(null)

  useEffect(() => {
    void generate().then(() => translationRef.current?.focus())
  }, [generate])

  function handleSubmit(translation: string) {
    if (generateState.status !== 'complete') {
      return
    }
    setUserTranslation(translation)
    evaluate(generateState.exercise, translation)
  }

  function handlePolicyChange(next: ExercisePolicy.ExercisePolicy) {
    setPolicy(next)
    savePromiseRef.current = saveExercisePolicy(next)
  }

  async function handleNext() {
    setUserTranslation(null)
    await savePromiseRef.current
    await generate()
    translationRef.current?.focus()
  }

  if (generateState.status === 'error') {
    if (generateState.kind === 'empty-vocab') {
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
          {generateState.message}
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

  const exercise: Partial<Exercise.Exercise> =
    generateState.status === 'complete'
      ? generateState.exercise
      : generateState.status === 'streaming'
        ? generateState.partial
        : {}
  const isStreaming = generateState.status !== 'complete'

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <PracticeHeader
        right={
          <PolicyEditor
            policy={policy}
            onPolicyChange={handlePolicyChange}
            sets={sets}
          />
        }
      />
      <ExerciseCard exercise={exercise} status={generateState.status} />
      <AnimatePresence mode="wait">
        {userTranslation === null ? (
          <motion.div key="form">
            <TranslationForm
              ref={translationRef}
              onSubmit={handleSubmit}
              disabled={isStreaming}
            />
          </motion.div>
        ) : (
          <motion.div key="evaluated" className="flex flex-col gap-6">
            <div className="bg-background border-input rounded-xl border px-4 py-3">
              <p className="text-sm">{userTranslation}</p>
            </div>
            {(evaluationState.status === 'streaming' ||
              evaluationState.status === 'complete') && (
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.md }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -motionTokens.distance.lg }}
                transition={transitions.ease}
              >
                <EvaluationCard
                  evaluation={
                    evaluationState.status === 'streaming'
                      ? evaluationState.partial
                      : evaluationState.evaluation
                  }
                  status={evaluationState.status}
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
