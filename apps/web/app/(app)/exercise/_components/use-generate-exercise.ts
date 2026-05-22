import { generateExercise } from '@/app/actions'
import { Exercise } from '@lingua-hub/exercise'
import { Result } from '@praha/byethrow'
import { useCallback, useState } from 'react'

type GenerateState =
  | { status: 'loading' }
  | { status: 'complete'; exercise: Exercise.Exercise }
  | {
      status: 'error'
      kind: 'empty-vocab' | 'scoped-set-not-found' | 'other'
      message: string
    }

export function useGenerateExercise() {
  const [state, setState] = useState<GenerateState>({ status: 'loading' })

  const generate = useCallback(async (scope?: string) => {
    setState({ status: 'loading' })

    try {
      const result = await generateExercise(scope)

      if (Result.isFailure(result)) {
        const kind =
          result.error.type === 'EmptyVocabError'
            ? 'empty-vocab'
            : result.error.type === 'CuratedSetNotFoundError'
              ? 'scoped-set-not-found'
              : 'other'
        setState({ status: 'error', kind, message: result.error.message })
        return
      }

      setState({ status: 'complete', exercise: result.value })
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
