import type { Language, UserId } from '@lingua-hub/core'
import type {
  CuratedContentRepository,
  CuratedSetNotFoundError,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import * as ExercisePolicy from '../models/exercise-policy'
import * as ExerciseScope from '../models/exercise-scope'
import type { ExercisePolicyRepository } from '../ports/exercise-policy-repository'

export type ResolveExercisePolicyDeps = {
  findSetById: CuratedContentRepository['findSetById']
  findByUserIdAndLanguage: ExercisePolicyRepository['findByUserIdAndLanguage']
}

type ResolveExercisePolicyInput = {
  scope: ExerciseScope.ExerciseScope
  userId: UserId.UserId
  language: Language.Language
}

export function makeResolveExercisePolicy({
  findSetById,
  findByUserIdAndLanguage,
}: ResolveExercisePolicyDeps) {
  return async ({
    scope,
    userId,
    language,
  }: ResolveExercisePolicyInput): Promise<
    Result.Result<ExercisePolicy.ExercisePolicy, CuratedSetNotFoundError>
  > => {
    switch (scope.type) {
      case 'set': {
        const setResult = await findSetById({ id: scope.setId })
        if (Result.isFailure(setResult)) {
          return setResult
        }
        return Result.succeed(ExercisePolicy.fromSet(setResult.value))
      }
      case 'saved': {
        const policy = await findByUserIdAndLanguage({ userId, language })
        return Result.succeed(policy)
      }
    }
  }
}
