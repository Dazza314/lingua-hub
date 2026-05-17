import { Language, UserId } from '@lingua-hub/core'
import {
  type GenerateObjectParams,
  type LlmClient,
  LlmStreamError,
} from '@lingua-hub/llm'
import { CuratedSetNotFoundError } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { describe, expect, it } from 'vitest'
import { EmptyVocabError } from '../errors'
import * as ExercisePolicy from '../models/exercise-policy'
import {
  type GenerateExerciseDeps,
  generateExercise,
} from './generate-exercise'

const USER_ID = UserId.userIdSchema.parse(
  '00000000-0000-4000-8000-000000000000',
)
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')
const POLICY: ExercisePolicy.ExercisePolicy = {
  vocab: [{ type: 'imported_vocab' }],
  grammar: [],
}

type ExerciseDraft = {
  sentence: string
  contextTag: string
}

const FINAL_DRAFT: ExerciseDraft = {
  sentence: 'I would like a coffee, please.',
  contextTag: '[a customer, at a coffee shop]',
}

type FakeStreamObject = {
  streamObject: LlmClient['streamObject']
  calls: GenerateObjectParams<unknown>[]
}

function makeStreamObject(
  chunks: Result.Result<unknown, LlmStreamError>[],
): FakeStreamObject {
  const calls: GenerateObjectParams<unknown>[] = []
  const streamObject = (async <T>(params: GenerateObjectParams<T>) => {
    calls.push(params as GenerateObjectParams<unknown>)
    return (async function* () {
      for (const chunk of chunks) {
        yield chunk
      }
    })()
  }) as unknown as LlmClient['streamObject']
  return { streamObject, calls }
}

function chunksFor(draft: ExerciseDraft): Result.Result<unknown, never>[] {
  return [
    Result.succeed({ contextTag: draft.contextTag }),
    Result.succeed({
      contextTag: draft.contextTag,
      sentence: draft.sentence.slice(0, 10),
    }),
    Result.succeed(draft),
  ]
}

function makeEvaluateExercisePolicy(
  vocabTerms: string[],
): GenerateExerciseDeps['evaluateExercisePolicy'] {
  return () =>
    Promise.resolve(Result.succeed({ vocabTerms, grammarPoints: [] }))
}

async function drain<T, E>(
  iterable: AsyncIterable<Result.Result<T, E>>,
): Promise<Result.Result<T, E>[]> {
  const collected: Result.Result<T, E>[] = []
  for await (const chunk of iterable) {
    collected.push(chunk)
  }
  return collected
}

function getUserPrompt(calls: GenerateObjectParams<unknown>[]): string {
  return calls[0]?.messages[0]?.content ?? ''
}

function countBulletLines(content: string): number {
  return (content.match(/^- /gm) ?? []).length
}

describe('generateExercise', () => {
  it('streams partial chunks and a final draft on the happy path', async () => {
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    const result = await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy([
        'term-1',
        'term-2',
        'term-3',
      ]),
      streamObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(result.type).toBe('Success')
    if (result.type !== 'Success') {
      return
    }

    const drained = await drain(result.value)
    expect(drained).toHaveLength(3)
    const last = drained[drained.length - 1]
    expect(last && Result.isSuccess(last)).toBe(true)
    if (last && Result.isSuccess(last)) {
      expect(last.value).toEqual({ ...FINAL_DRAFT, language: TARGET_LANGUAGE })
    }
    expect(calls).toHaveLength(1)
  })

  it('passes exactly `count` vocab items to the LLM when vocab is larger than count', async () => {
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))
    const vocabTerms = Array.from({ length: 10 }, (_, i) => `term-${i}`)

    await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(vocabTerms),
      streamObject,
    })({
      userId: USER_ID,
      targetLanguage: TARGET_LANGUAGE,
      policy: POLICY,
      vocabItemCount: 3,
    })

    expect(countBulletLines(getUserPrompt(calls))).toBe(3)
  })

  it('passes all vocab items when `count` exceeds the vocab size', async () => {
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term-1', 'term-2']),
      streamObject,
    })({
      userId: USER_ID,
      targetLanguage: TARGET_LANGUAGE,
      policy: POLICY,
      vocabItemCount: 5,
    })

    expect(countBulletLines(getUserPrompt(calls))).toBe(2)
  })

  it('returns EmptyVocabError without calling the LLM when vocab is empty', async () => {
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    const result = await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy([]),
      streamObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(EmptyVocabError)
    }
    expect(calls).toHaveLength(0)
  })

  it('returns CuratedSetNotFoundError without calling the LLM when policy evaluation fails', async () => {
    const setError = new CuratedSetNotFoundError('set not found')
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    const result = await generateExercise({
      evaluateExercisePolicy: () => Promise.resolve(Result.fail(setError)),
      streamObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(CuratedSetNotFoundError)
    }
    expect(calls).toHaveLength(0)
  })

  it('surfaces stream errors as failed chunks within the iterable', async () => {
    const streamError = new LlmStreamError('mid-stream failure')
    const { streamObject } = makeStreamObject([
      Result.succeed({ contextTag: '[' }),
      Result.fail(streamError),
    ])

    const result = await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term']),
      streamObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(result.type).toBe('Success')
    if (result.type !== 'Success') {
      return
    }

    const drained = await drain(result.value)
    expect(drained).toHaveLength(2)
    const last = drained[1]
    expect(last && Result.isFailure(last)).toBe(true)
    if (last && Result.isFailure(last)) {
      expect(last.error).toBe(streamError)
    }
  })
})
