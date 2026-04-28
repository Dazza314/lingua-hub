import { Exercise } from '@lingua-hub/exercise'
import { useCallback, useState } from 'react'

type GenerateState =
  | { status: 'idle' }
  | { status: 'streaming'; partial: Partial<Exercise.Exercise> }
  | { status: 'complete'; exercise: Exercise.Exercise }
  | { status: 'error'; kind: 'empty-vocab' | 'other'; message: string }

export function useGenerateExercise() {
  const [state, setState] = useState<GenerateState>({ status: 'idle' })

  const generate = useCallback(async () => {
    setState({ status: 'streaming', partial: {} })

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
      const decoder = new TextDecoder()
      let buffer = ''
      let lastPartial: Partial<Exercise.Exercise> = {}

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
          const partial = JSON.parse(line) as Partial<Exercise.Exercise>
          lastPartial = partial
          setState({ status: 'streaming', partial })
        }
      }

      const parsed = Exercise.exerciseSchema.safeParse(lastPartial)
      if (parsed.success) {
        setState({ status: 'complete', exercise: parsed.data })
      } else {
        throw new Error('Invalid exercise response')
      }
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
