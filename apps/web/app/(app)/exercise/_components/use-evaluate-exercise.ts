import type { Exercise } from '@lingua-hub/exercise'
import { Evaluation } from '@lingua-hub/exercise'
import { useState } from 'react'
import { streamOrderedFields } from '../../stream-ordered-fields'

type EvaluationState =
  | { status: 'idle' }
  | { status: 'streaming'; partial: Partial<Evaluation.Evaluation> }
  | { status: 'complete'; evaluation: Evaluation.Evaluation }
  | { status: 'error'; error: Error }

export function useEvaluateExercise() {
  const [state, setState] = useState<EvaluationState>({ status: 'idle' })

  async function evaluate(
    exercise: Exercise.Exercise,
    userTranslation: string,
  ) {
    setState({ status: 'streaming', partial: {} })

    try {
      const response = await fetch('/api/exercise/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise, userTranslation }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`Evaluation failed: ${response.status}`)
      }

      const reader = response.body.getReader()

      const raw = await streamOrderedFields<Evaluation.Evaluation>({
        reader,
        setState: (partial) => setState({ status: 'streaming', partial }),
        fieldNames: ['feedback', 'suggestedTranslation'],
      })

      const parsed = Evaluation.evaluationSchema.safeParse(raw)
      if (parsed.success) {
        setState({ status: 'complete', evaluation: parsed.data })
      } else {
        throw new Error('Invalid evaluation response')
      }
    } catch (err) {
      setState({
        status: 'error',
        error: err instanceof Error ? err : new Error('Evaluation failed'),
      })
    }
  }

  return { state, evaluate }
}
