import type { Language, UserId } from '@lingua-hub/core'
import type { ExercisePolicy } from '../models/exercise-policy'
import type { ExercisePolicyRepository } from '../ports/exercise-policy-repository'

export type SaveExercisePolicyDeps = {
  upsert: ExercisePolicyRepository['upsert']
}

export function saveExercisePolicy({ upsert }: SaveExercisePolicyDeps) {
  return ({
    userId,
    language,
    policy,
  }: {
    userId: UserId.UserId
    language: Language.Language
    policy: ExercisePolicy
  }) => upsert({ userId, language, policy })
}
