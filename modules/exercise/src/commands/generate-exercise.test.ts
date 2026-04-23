import { Language, UserId } from '@lingua-hub/core'
import {
  UnexpectedLlmError,
  type GenerateObjectParams,
  type LlmClient,
} from '@lingua-hub/llm'
import {
  Models as VocabModels,
  UnexpectedVocabRepositoryError,
  type VocabItem,
  type VocabRepository,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { describe, expect, it } from 'vitest'
import { EmptyVocabError, UnexpectedExerciseError } from '../errors'
import type { Exercise } from '../models/exercise'
import { generateExercise } from './generate-exercise'

const USER_ID = UserId.userIdSchema.parse(
  '00000000-0000-4000-8000-000000000000',
)
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')

let vocabCounter = 0

const EXERCISE: Exercise = {
  language: Language.languageSchema.parse('ja'),
  sentence: 'I would like a coffee, please.',
  scenarioFrame: {
    setting: 'a coffee shop',
    situation: 'ordering a drink',
  },
}

function makeVocabItem(n: number): VocabItem {
  vocabCounter += 1
  const suffix = vocabCounter.toString(16).padStart(12, '0')
  return VocabModels.VocabItem.vocabItemSchema.parse({
    id: `00000000-0000-4000-8000-${suffix}`,
    language: 'ja',
    term: `term-${n}`,
    definition: `definition-${n}`,
  })
}

function makeGetVocabItems(
  result: Result.Result<VocabItem[], UnexpectedVocabRepositoryError>,
): VocabRepository['getVocabItems'] {
  return () => Promise.resolve(result)
}

type FakeGenerateObject = {
  generateObject: LlmClient['generateObject']
  calls: GenerateObjectParams<unknown>[]
}

function makeGenerateObject(
  result: Result.Result<Exercise, UnexpectedLlmError>,
): FakeGenerateObject {
  const calls: GenerateObjectParams<unknown>[] = []
  const generateObject: LlmClient['generateObject'] = <T>(
    params: GenerateObjectParams<T>,
  ) => {
    calls.push(params as GenerateObjectParams<unknown>)
    return Promise.resolve(result) as Result.ResultAsync<T, UnexpectedLlmError>
  }
  return { generateObject, calls }
}

function getUserPrompt(calls: GenerateObjectParams<unknown>[]): string {
  return calls[0]?.messages[0]?.content ?? ''
}

function countBulletLines(content: string): number {
  return (content.match(/^- /gm) ?? []).length
}

describe('generateExercise', () => {
  it('returns the exercise produced by the LLM on the happy path', async () => {
    const items = Array.from({ length: 10 }, (_, i) => makeVocabItem(i))
    const { generateObject, calls } = makeGenerateObject(Result.succeed(EXERCISE))

    const result = await generateExercise({
      generateObject,
      getVocabItems: makeGetVocabItems(Result.succeed(items)),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, count: 3 })

    expect(result.type).toBe('Success')
    if (result.type === 'Success') {
      expect(result.value).toEqual(EXERCISE)
    }
    expect(calls).toHaveLength(1)
  })

  it('passes exactly `count` vocab items to the LLM when vocab is larger than count', async () => {
    const items = Array.from({ length: 10 }, (_, i) => makeVocabItem(i))
    const { generateObject, calls } = makeGenerateObject(Result.succeed(EXERCISE))

    await generateExercise({
      generateObject,
      getVocabItems: makeGetVocabItems(Result.succeed(items)),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, count: 3 })

    expect(countBulletLines(getUserPrompt(calls))).toBe(3)
  })

  it('passes all vocab items when `count` exceeds the vocab size', async () => {
    const items = Array.from({ length: 2 }, (_, i) => makeVocabItem(i))
    const { generateObject, calls } = makeGenerateObject(Result.succeed(EXERCISE))

    await generateExercise({
      generateObject,
      getVocabItems: makeGetVocabItems(Result.succeed(items)),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, count: 5 })

    expect(countBulletLines(getUserPrompt(calls))).toBe(2)
  })

  it('returns EmptyVocabError when the learner has no vocab', async () => {
    const { generateObject, calls } = makeGenerateObject(Result.succeed(EXERCISE))

    const result = await generateExercise({
      generateObject,
      getVocabItems: makeGetVocabItems(Result.succeed([])),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(EmptyVocabError)
    }
    expect(calls).toHaveLength(0)
  })

  it('wraps a vocab repository failure in UnexpectedExerciseError', async () => {
    const vocabError = new UnexpectedVocabRepositoryError('db is down')
    const { generateObject, calls } = makeGenerateObject(Result.succeed(EXERCISE))

    const result = await generateExercise({
      generateObject,
      getVocabItems: makeGetVocabItems(Result.fail(vocabError)),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(UnexpectedExerciseError)
      expect(result.error.cause).toBe(vocabError)
    }
    expect(calls).toHaveLength(0)
  })

  it('wraps an LLM failure in UnexpectedExerciseError', async () => {
    const llmError = new UnexpectedLlmError('model timed out')
    const items = [makeVocabItem(0)]
    const { generateObject } = makeGenerateObject(Result.fail(llmError))

    const result = await generateExercise({
      generateObject,
      getVocabItems: makeGetVocabItems(Result.succeed(items)),
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(UnexpectedExerciseError)
      expect(result.error.cause).toBe(llmError)
    }
  })
})
