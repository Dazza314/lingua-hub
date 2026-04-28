import { Language, UserId } from '@lingua-hub/core'
import {
  type GenerateObjectParams,
  type LlmClient,
  LlmStreamError,
} from '@lingua-hub/llm'
import type { VocabItem, VocabRepository } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { describe, expect, it } from 'vitest'
import { EmptyVocabError } from '../errors'
import { generateExercise } from './generate-exercise'

const USER_ID = UserId.userIdSchema.parse(
  '00000000-0000-4000-8000-000000000000',
)
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

let vocabCounter = 0

type ExerciseDraft = {
  sentence: string
  scenarioFrame: { setting: string; situation: string }
}

const FINAL_DRAFT: ExerciseDraft = {
  sentence: 'I would like a coffee, please.',
  scenarioFrame: {
    setting: 'a coffee shop',
    situation: 'ordering a drink',
  },
}

function makeVocabItem(n: number): VocabItem {
  vocabCounter += 1
  const suffix = vocabCounter.toString(16).padStart(12, '0')
  return {
    id: `00000000-0000-4000-8000-${suffix}` as VocabItem['id'],
    language: 'ja' as VocabItem['language'],
    term: `term-${n}`,
    definition: `definition-${n}`,
  }
}

function makeGetVocabItems(
  items: VocabItem[],
): VocabRepository['getVocabItems'] {
  return () => Promise.resolve(items)
}

function makeGetVocabItemsThrowing(
  error: Error,
): VocabRepository['getVocabItems'] {
  return () => Promise.reject(error)
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

function makeStreamObjectThrowing(error: Error): LlmClient['streamObject'] {
  return () => Promise.reject(error)
}

function chunksFor(draft: ExerciseDraft): Result.Result<unknown, never>[] {
  return [
    Result.succeed({ scenarioFrame: { setting: draft.scenarioFrame.setting } }),
    Result.succeed({ scenarioFrame: draft.scenarioFrame }),
    Result.succeed(draft),
  ]
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
    const items = Array.from({ length: 10 }, (_, i) => makeVocabItem(i))
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    const result = await generateExercise({
      streamObject,
      getVocabItems: makeGetVocabItems(items),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, count: 3 })

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
    const items = Array.from({ length: 10 }, (_, i) => makeVocabItem(i))
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    await generateExercise({
      streamObject,
      getVocabItems: makeGetVocabItems(items),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, count: 3 })

    expect(countBulletLines(getUserPrompt(calls))).toBe(3)
  })

  it('passes all vocab items when `count` exceeds the vocab size', async () => {
    const items = Array.from({ length: 2 }, (_, i) => makeVocabItem(i))
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    await generateExercise({
      streamObject,
      getVocabItems: makeGetVocabItems(items),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, count: 5 })

    expect(countBulletLines(getUserPrompt(calls))).toBe(2)
  })

  it('returns EmptyVocabError without calling the LLM when the learner has no vocab', async () => {
    const { streamObject, calls } = makeStreamObject(chunksFor(FINAL_DRAFT))

    const result = await generateExercise({
      streamObject,
      getVocabItems: makeGetVocabItems([]),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(EmptyVocabError)
    }
    expect(calls).toHaveLength(0)
  })

  it('throws when the vocab repository fails', async () => {
    const repoError = new Error('db is down')
    const { streamObject } = makeStreamObject(chunksFor(FINAL_DRAFT))

    await expect(
      generateExercise({
        streamObject,
        getVocabItems: makeGetVocabItemsThrowing(repoError),
      })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE }),
    ).rejects.toThrow(repoError)
  })

  it('throws when the LLM call itself rejects', async () => {
    const llmError = new Error('model timed out')
    const items = [makeVocabItem(0)]

    await expect(
      generateExercise({
        streamObject: makeStreamObjectThrowing(llmError),
        getVocabItems: makeGetVocabItems(items),
      })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE }),
    ).rejects.toThrow(llmError)
  })

  it('surfaces stream errors as failed chunks within the iterable', async () => {
    const streamError = new LlmStreamError('mid-stream failure')
    const items = [makeVocabItem(0)]
    const { streamObject } = makeStreamObject([
      Result.succeed({ scenarioFrame: { setting: 'a' } }),
      Result.fail(streamError),
    ])

    const result = await generateExercise({
      streamObject,
      getVocabItems: makeGetVocabItems(items),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE })

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
