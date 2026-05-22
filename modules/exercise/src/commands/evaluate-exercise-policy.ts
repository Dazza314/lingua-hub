import type { Language, UserId } from '@lingua-hub/core'
import type {
  CuratedContentRepository,
  CuratedGrammarPoint,
  CuratedSetId,
  CuratedSetWithItems,
  ImportedVocabRepository,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import * as ExercisePolicy from '../models/exercise-policy'

export type EvaluateExercisePolicyDeps = {
  findSetWithItemsById: CuratedContentRepository['findSetWithItemsById']
  getImportedVocabItems: ImportedVocabRepository['getImportedVocabItems']
}

type EvaluateExercisePolicyInput = {
  policy: ExercisePolicy.ExercisePolicy
  userId: UserId.UserId
  language: Language.Language
}

type EvaluateExercisePolicyOutput = {
  vocabTerms: string[]
  grammarPoints: CuratedGrammarPoint.CuratedGrammarPoint[]
}

export function makeEvaluateExercisePolicy(deps: EvaluateExercisePolicyDeps) {
  return async ({
    policy,
    userId,
    language,
  }: EvaluateExercisePolicyInput): Promise<EvaluateExercisePolicyOutput> => {
    const [vocabTerms, grammarPoints] = await Promise.all([
      resolveVocabTerms(deps, policy.vocab, userId, language),
      resolveGrammarPoints(deps, policy.grammar),
    ])

    return { vocabTerms, grammarPoints }
  }
}

async function resolveVocabTerms(
  deps: EvaluateExercisePolicyDeps,
  vocab: ExercisePolicy.VocabPolicy,
  userId: UserId.UserId,
  language: Language.Language,
): Promise<string[]> {
  const sets = await resolveSets(deps, vocab.setIds)
  const sourceTerms = sets.flatMap((set) => set.vocabItems.map((v) => v.term))

  if (!vocab.importedVocab) {
    return unique(sourceTerms)
  }

  const importedItems = await deps.getImportedVocabItems({ userId, language })
  return unique([...sourceTerms, ...importedItems.map(({ term }) => term)])
}

async function resolveGrammarPoints(
  deps: EvaluateExercisePolicyDeps,
  grammar: ExercisePolicy.GrammarPolicy,
): Promise<CuratedGrammarPoint.CuratedGrammarPoint[]> {
  const sets = await resolveSets(deps, grammar.setIds)
  return uniqueById(sets.flatMap((set) => set.grammarPoints))
}

// Set IDs come from a policy with no DB foreign key (see
// docs/adr/exercise-policy-set-storage.md): a curated set deleted after it was
// added to a policy is skipped, not treated as a hard failure.
async function resolveSets(
  deps: EvaluateExercisePolicyDeps,
  setIds: CuratedSetId.CuratedSetId[],
): Promise<CuratedSetWithItems.CuratedSetWithItems[]> {
  const results = await Promise.all(
    setIds.map((id) => deps.findSetWithItemsById({ id })),
  )
  return results.filter(Result.isSuccess).map((result) => result.value)
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

function uniqueById<T extends { id: unknown }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}
