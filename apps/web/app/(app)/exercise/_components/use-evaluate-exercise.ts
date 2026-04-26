import { Evaluation } from '@lingua-hub/exercise'
import type { Exercise } from '@lingua-hub/exercise'
import { useState } from 'react'

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
      const decoder = new TextDecoder()
      let buffer = ''
      let lastPartial: Partial<Evaluation.Evaluation> = {}

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) {
            continue
          }
          const partial = JSON.parse(line) as Partial<Evaluation.Evaluation>
          lastPartial = partial
          setState({ status: 'streaming', partial })
        }
      }

      const parsed = Evaluation.evaluationSchema.safeParse(lastPartial)
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
