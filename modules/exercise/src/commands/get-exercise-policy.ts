import type { Language, UserId } from '@lingua-hub/core'
import type { ExercisePolicyRepository } from '../ports/exercise-policy-repository'

export type GetExercisePolicyDeps = {
  findByUserIdAndLanguage: ExercisePolicyRepository['findByUserIdAndLanguage']
}

export function makeGetExercisePolicy({
  findByUserIdAndLanguage,
}: GetExercisePolicyDeps) {
  return ({
    userId,
    language,
  }: {
    userId: UserId.UserId
    language: Language.Language
  }) => findByUserIdAndLanguage({ userId, language })
}
