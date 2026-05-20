'use client'

import { saveExercisePolicy } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { motionTokens, transitions } from '@/lib/animations'
import { Exercise, ExercisePolicy } from '@lingua-hub/exercise'
import { CuratedSetId } from '@lingua-hub/vocab'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { EvaluationCard } from './EvaluationCard'
import { ExerciseCard } from './ExerciseCard'
import { PolicyEditor } from './PolicyEditor'
import { PracticeHeader } from './PracticeHeader'
import { ScopedSessionChip } from './ScopedSessionChip'
import { TranslationForm } from './TranslationForm'
import { useEvaluateExercise } from './use-evaluate-exercise'
import { useGenerateExercise } from './use-generate-exercise'

type Set = { id: CuratedSetId.CuratedSetId; title: string }

type Scope = { setId: CuratedSetId.CuratedSetId; setTitle: string }

type Props =
  | {
      initialPolicy: ExercisePolicy.ExercisePolicy
      sets: Set[]
      hasImportedVocab: boolean
      scope?: undefined
    }
  | {
      initialPolicy: ExercisePolicy.ExercisePolicy
      scope: Scope
      sets?: undefined
      hasImportedVocab?: undefined
    }

export function ExerciseView(props: Props) {
  const { state: generateState, generate } = useGenerateExercise()
  const { state: evaluationState, evaluate } = useEvaluateExercise()
  const [userTranslation, setUserTranslation] = useState<string | null>(null)
  const [policy, setPolicy] = useState<ExercisePolicy.ExercisePolicy>(
    props.initialPolicy,
  )
  const translationRef = useRef<HTMLTextAreaElement>(null)
  const savePromiseRef = useRef<Promise<unknown> | null>(null)

  const scopeParam = props.scope ? `set:${props.scope.setId}` : undefined

  useEffect(() => {
    void generate(scopeParam).then(() => translationRef.current?.focus())
  }, [generate, scopeParam])

  function handleSubmit(translation: string) {
    if (generateState.status !== 'complete') {
      return
    }
    setUserTranslation(translation)
    evaluate(generateState.exercise, translation)
  }

  function handlePolicyChange(next: ExercisePolicy.ExercisePolicy) {
    if (props.scope) {
      return
    }
    setPolicy(next)
    savePromiseRef.current = saveExercisePolicy(next)
  }

  async function handleNext() {
    setUserTranslation(null)
    await savePromiseRef.current
    await generate(scopeParam)
    translationRef.current?.focus()
  }

  if (generateState.status === 'error') {
    if (generateState.kind === 'empty-vocab') {
      if (props.scope) {
        return (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="text-muted-foreground text-center text-sm">
              This set has no vocabulary yet.
            </p>
          </div>
        )
      }
      const hasVocabSource =
        policy.vocab.setIds.length > 0 || policy.vocab.importedVocab
      return (
        <div className="flex flex-1 flex-col gap-6 px-4 py-6">
          <PracticeHeader
            right={
              <PolicyEditor
                policy={policy}
                onPolicyChange={handlePolicyChange}
                sets={props.sets}
                hasImportedVocab={props.hasImportedVocab}
              />
            }
          />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
            <p className="text-muted-foreground text-center text-sm">
              Pick a set in the filter to start practicing.
            </p>
            <Button
              size="lg"
              onClick={() => {
                void generate(scopeParam).then(() =>
                  translationRef.current?.focus(),
                )
              }}
              disabled={!hasVocabSource}
            >
              Start practicing
            </Button>
          </div>
        </div>
      )
    }
    if (generateState.kind === 'scoped-set-not-found') {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-muted-foreground text-center text-sm">
            This set is no longer available.
          </p>
          <Link
            href="/exercise"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            Exit scoped session
          </Link>
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
          props.scope ? (
            <ScopedSessionChip title={props.scope.setTitle} />
          ) : (
            <PolicyEditor
              policy={policy}
              onPolicyChange={handlePolicyChange}
              sets={props.sets}
              hasImportedVocab={props.hasImportedVocab}
            />
          )
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
