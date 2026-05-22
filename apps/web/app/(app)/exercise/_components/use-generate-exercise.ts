import { Exercise } from '@lingua-hub/exercise'
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
      const url = scope
        ? `/api/exercise/generate?scope=${encodeURIComponent(scope)}`
        : '/api/exercise/generate'
      const response = await fetch(url, { method: 'POST' })

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
        if (body?.error?.type === 'CuratedSetNotFoundError') {
          setState({
            status: 'error',
            kind: 'scoped-set-not-found',
            message: body.error.message ?? 'Set not found',
          })
          return
        }
        if (body?.error?.message) {
          setState({
            status: 'error',
            kind: 'other',
            message: body.error.message,
          })
          return
        }
      }

      if (!response.ok) {
        throw new Error(`Generate failed: ${response.status}`)
      }

      const exercise = (await response.json()) as Exercise.Exercise
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
