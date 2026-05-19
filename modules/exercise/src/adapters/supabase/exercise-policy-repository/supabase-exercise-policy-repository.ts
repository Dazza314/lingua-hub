import { createFindByUserIdAndLanguage } from './find-by-user-id-and-language'
import { createUpsert } from './upsert'

export const supabaseExercisePolicyRepositoryFactories = {
  createFindByUserIdAndLanguage,
  createUpsert,
}
