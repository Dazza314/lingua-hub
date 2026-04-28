import { Exercise } from '@lingua-hub/exercise'
import { useCallback, useState } from 'react'
import { streamOrderedFields } from '../../stream-ordered-fields'

type GenerateState =
  | { status: 'loading' }
  | { status: 'streaming'; partial: Partial<Exercise.Exercise> }
  | { status: 'complete'; exercise: Exercise.Exercise }
  | { status: 'error'; kind: 'empty-vocab' | 'other'; message: string }

export function useGenerateExercise() {
  const [state, setState] = useState<GenerateState>({ status: 'loading' })

  const generate = useCallback(async () => {
    setState({ status: 'loading' })

    try {
      const response = await fetch('/api/exercise/generate', { method: 'POST' })

      if (response.status === 422) {
        const body = (await response.json().catch(() => null)) as {
          error?: { type?: string; message?: string }
        } | null
        if (body?.error?.type === 'EmptyVocabError') {
          setState({
            status: 'error',
            kind: 'empty-vocab',
            message: body.error.message ?? 'No vocabulary items found',
          })
          return
        }
      }

      if (!response.ok || !response.body) {
        throw new Error(`Generate failed: ${response.status}`)
      }

      const reader = response.body.getReader()

      const exercise = await streamOrderedFields<Exercise.Exercise>({
        reader,
        setState: (partial) => {
          setState({ status: 'streaming', partial })
        },
        fieldNames: ['scenario', 'sentence'],
      })

      setState({ status: 'complete', exercise })
    } catch (err) {
      setState({
        status: 'error',
        kind: 'other',
        message: err instanceof Error ? err.message : 'Generate failed',
      })
    }
  }, [])

  return { state, generate }
}
