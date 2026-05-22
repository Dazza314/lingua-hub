import { Language, UserId } from '@lingua-hub/core'
import { type GenerateObjectParams, type LlmClient } from '@lingua-hub/llm'
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
const POLICY: ExercisePolicy.ExercisePolicy = ExercisePolicy.dangerouslyCast({
  vocab: { setIds: [], importedVocab: true },
  grammar: { setIds: [] },
})

const CANDIDATE_A = {
  sentence: 'コーヒーをください。',
  contextTag: '[a customer, at a café]',
}
const CANDIDATE_B = {
  sentence: 'コーヒーを一杯お願いします。',
  contextTag: '[someone, ordering at a counter]',
}
const CANDIDATE_C = {
  sentence: 'コーヒーにしようかな。',
  contextTag: '[someone, deciding what to order]',
}

type FakeGenerateObject = {
  generateObject: LlmClient['generateObject']
  calls: GenerateObjectParams<unknown>[]
}

function makeGenerateObject(responses: unknown[]): FakeGenerateObject {
  const calls: GenerateObjectParams<unknown>[] = []
  let callIndex = 0
  const generateObject = (async <T>(params: GenerateObjectParams<T>) => {
    calls.push(params as GenerateObjectParams<unknown>)
    return responses[callIndex++] as T
  }) as unknown as LlmClient['generateObject']
  return { generateObject, calls }
}

function makeEvaluateExercisePolicy(
  vocabTerms: string[],
): GenerateExerciseDeps['evaluateExercisePolicy'] {
  return () => Promise.resolve({ vocabTerms, grammarPoints: [] })
}

function getGeneratorUserPrompt(
  calls: GenerateObjectParams<unknown>[],
): string {
  return calls[0]?.messages[0]?.content ?? ''
}

function countBulletLines(content: string): number {
  return (content.match(/^- /gm) ?? []).length
}

describe('generateExercise', () => {
  it('returns the judge-chosen candidate on the happy path', async () => {
    const { generateObject } = makeGenerateObject([
      { candidates: [CANDIDATE_A, CANDIDATE_B, CANDIDATE_C] },
      { chosenIndex: 1, reasoning: 'Most natural phrasing.' },
    ])

    const result = await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term-1', 'term-2']),
      generateObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(result.type).toBe('Success')
    if (result.type !== 'Success') {
      return
    }
    expect(result.value).toEqual({ ...CANDIDATE_B, language: TARGET_LANGUAGE })
  })

  it('makes exactly two LLM calls (generator then judge)', async () => {
    const { generateObject, calls } = makeGenerateObject([
      { candidates: [CANDIDATE_A, CANDIDATE_B] },
      { chosenIndex: 0, reasoning: 'Simpler.' },
    ])

    await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term-1']),
      generateObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(calls).toHaveLength(2)
  })

  it('passes exactly `vocabItemCount` vocab items to the LLM when vocab is larger', async () => {
    const { generateObject, calls } = makeGenerateObject([
      { candidates: [CANDIDATE_A] },
      { chosenIndex: 0, reasoning: '' },
    ])
    const vocabTerms = Array.from({ length: 10 }, (_, i) => `term-${i}`)

    await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(vocabTerms),
      generateObject,
    })({
      userId: USER_ID,
      targetLanguage: TARGET_LANGUAGE,
      policy: POLICY,
      vocabItemCount: 3,
    })

    expect(countBulletLines(getGeneratorUserPrompt(calls))).toBe(3)
  })

  it('passes all vocab items when `vocabItemCount` exceeds the vocab size', async () => {
    const { generateObject, calls } = makeGenerateObject([
      { candidates: [CANDIDATE_A] },
      { chosenIndex: 0, reasoning: '' },
    ])

    await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term-1', 'term-2']),
      generateObject,
    })({
      userId: USER_ID,
      targetLanguage: TARGET_LANGUAGE,
      policy: POLICY,
      vocabItemCount: 5,
    })

    expect(countBulletLines(getGeneratorUserPrompt(calls))).toBe(2)
  })

  it('mentions candidateCount in the generator prompt', async () => {
    const { generateObject, calls } = makeGenerateObject([
      { candidates: [CANDIDATE_A] },
      { chosenIndex: 0, reasoning: '' },
    ])

    await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term-1']),
      generateObject,
    })({
      userId: USER_ID,
      targetLanguage: TARGET_LANGUAGE,
      policy: POLICY,
      candidateCount: 5,
    })

    expect(getGeneratorUserPrompt(calls)).toContain('5')
  })

  it('returns EmptyVocabError without calling the LLM when vocab is empty', async () => {
    const { generateObject, calls } = makeGenerateObject([])

    const result = await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy([]),
      generateObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBeInstanceOf(EmptyVocabError)
    }
    expect(calls).toHaveLength(0)
  })

  it('falls back to the first candidate if the judge returns an out-of-range index', async () => {
    const { generateObject } = makeGenerateObject([
      { candidates: [CANDIDATE_A, CANDIDATE_B] },
      { chosenIndex: 99, reasoning: 'Out of range.' },
    ])

    const result = await generateExercise({
      evaluateExercisePolicy: makeEvaluateExercisePolicy(['term-1']),
      generateObject,
    })({ userId: USER_ID, targetLanguage: TARGET_LANGUAGE, policy: POLICY })

    expect(Result.isSuccess(result)).toBe(true)
    if (Result.isSuccess(result)) {
      expect(result.value).toEqual({
        ...CANDIDATE_A,
        language: TARGET_LANGUAGE,
      })
    }
  })
})
