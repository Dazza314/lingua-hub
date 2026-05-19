import type { Language, UserId } from '@lingua-hub/core'
import type { ExercisePolicy } from '../models/exercise-policy'

export type ExercisePolicyRepository = {
  findByUserIdAndLanguage(params: {
    userId: UserId.UserId
    language: Language.Language
  }): Promise<ExercisePolicy>
  upsert(params: {
    userId: UserId.UserId
    language: Language.Language
    policy: ExercisePolicy
  }): Promise<void>
}
