import { Language, UserId } from '@lingua-hub/core'
import type { CuratedContentRepository } from '@lingua-hub/vocab'
import {
  CuratedSet,
  CuratedSetId,
  CuratedSetNotFoundError,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { describe, expect, it } from 'vitest'
import * as ExercisePolicy from '../models/exercise-policy'
import * as ExerciseScope from '../models/exercise-scope'
import type { ExercisePolicyRepository } from '../ports/exercise-policy-repository'
import { resolveExercisePolicy } from './resolve-exercise-policy'

const USER_ID = UserId.userIdSchema.parse(
  '00000000-0000-4000-8000-000000000000',
)
const LANGUAGE = Language.languageSchema.parse('ja')
const SET_ID = CuratedSetId.curatedSetIdSchema.parse(
  '00000000-0000-4000-8000-000000000001',
)

const STORED_POLICY: ExercisePolicy.ExercisePolicy =
  ExercisePolicy.dangerouslyCast({
    vocab: { setIds: [], importedVocab: true },
    grammar: { setIds: [] },
  })

function makeFindSetById(
  sets: CuratedSet.CuratedSet[],
): CuratedContentRepository['findSetById'] {
  return ({ id }) => {
    const set = sets.find((s) => s.id === id)
    return set
      ? Promise.resolve(Result.succeed(set))
      : Promise.resolve(Result.fail(new CuratedSetNotFoundError('not found')))
  }
}

function makeFindByUserIdAndLanguage(
  policy: ExercisePolicy.ExercisePolicy,
): ExercisePolicyRepository['findByUserIdAndLanguage'] {
  return () => Promise.resolve(policy)
}

function makeSet(id: CuratedSetId.CuratedSetId): CuratedSet.CuratedSet {
  return CuratedSet.dangerouslyCast({
    id,
    language: LANGUAGE,
    title: 'Test Set',
    category: 'Test category',
    vocabCount: 0,
    grammarCount: 0,
  })
}

const STORED_POLICY_DEPS = {
  findSetById: makeFindSetById([]),
  findByUserIdAndLanguage: makeFindByUserIdAndLanguage(STORED_POLICY),
}

describe('resolveExercisePolicy', () => {
  it('derives a policy from the set when scope targets a set', async () => {
    const result = await resolveExercisePolicy({
      ...STORED_POLICY_DEPS,
      findSetById: makeFindSetById([makeSet(SET_ID)]),
    })({
      scope: ExerciseScope.forSet(SET_ID),
      userId: USER_ID,
      language: LANGUAGE,
    })

    expect(result).toEqual(
      Result.succeed(ExercisePolicy.fromSet({ id: SET_ID })),
    )
  })

  it('propagates the failure when the scoped set is not found', async () => {
    const result = await resolveExercisePolicy(STORED_POLICY_DEPS)({
      scope: ExerciseScope.forSet(SET_ID),
      userId: USER_ID,
      language: LANGUAGE,
    })

    expect(Result.isFailure(result)).toBe(true)
  })

  it("returns the user's saved policy for the 'saved' scope", async () => {
    const result = await resolveExercisePolicy(STORED_POLICY_DEPS)({
      scope: ExerciseScope.saved,
      userId: USER_ID,
      language: LANGUAGE,
    })

    expect(result).toEqual(Result.succeed(STORED_POLICY))
  })
})
