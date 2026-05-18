import type { Language, UserId } from '@lingua-hub/core'
import type {
  CuratedContentRepository,
  CuratedGrammarPoint,
  ImportedVocabRepository,
} from '@lingua-hub/vocab'
import { CuratedSetNotFoundError } from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import * as ExercisePolicy from '../models/exercise-policy'

export type EvaluateExercisePolicyDeps = {
  findSelectedSetsByUserId: CuratedContentRepository['findSelectedSetsByUserId']
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

export function evaluateExercisePolicy(deps: EvaluateExercisePolicyDeps) {
  return ({
    policy,
    userId,
    language,
  }: EvaluateExercisePolicyInput): Result.ResultAsync<
    EvaluateExercisePolicyOutput,
    CuratedSetNotFoundError
  > =>
    Result.sequence({
      vocabTerms: resolveVocabTerms(deps, policy.vocab, userId, language),
      grammarPoints: resolveGrammarPoints(
        deps,
        policy.grammar,
        userId,
        language,
      ),
    })
}

async function resolveVocabTerms(
  deps: EvaluateExercisePolicyDeps,
  vocab: ExercisePolicy.VocabPolicy,
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<string[], CuratedSetNotFoundError> {
  const sourceResult = await resolveVocabSource(
    deps,
    vocab.source,
    userId,
    language,
  )
  if (Result.isFailure(sourceResult)) {
    return sourceResult
  }

  const sourceTerms = sourceResult.value

  if (!vocab.importedVocab) {
    return Result.succeed(unique(sourceTerms))
  }

  const importedItems = await deps.getImportedVocabItems({ userId, language })
  return Result.succeed(
    unique([...sourceTerms, ...importedItems.map(({ term }) => term)]),
  )
}

async function resolveVocabSource(
  deps: EvaluateExercisePolicyDeps,
  source: ExercisePolicy.VocabSource,
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<string[], CuratedSetNotFoundError> {
  switch (source.type) {
    case 'selectedSets': {
      const selectedSets = await deps.findSelectedSetsByUserId({ userId })
      const setsWithItems = selectedSets
        .filter((set) => set.language === language)
        .map((set) => deps.findSetWithItemsById({ id: set.id }))

      return Result.pipe(
        Result.sequence(setsWithItems),
        Result.map((setItems) =>
          setItems.flatMap((set) => set.vocabItems.map((v) => v.term)),
        ),
      )
    }
    case 'specificSets': {
      const setsWithItems = source.setIds.map((id) =>
        deps.findSetWithItemsById({ id }),
      )
      return Result.pipe(
        Result.sequence(setsWithItems),
        Result.map((setItems) =>
          setItems.flatMap((set) => set.vocabItems.map(({ term }) => term)),
        ),
      )
    }
  }
}

async function resolveGrammarPoints(
  deps: EvaluateExercisePolicyDeps,
  grammar: ExercisePolicy.GrammarPolicy,
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<
  CuratedGrammarPoint.CuratedGrammarPoint[],
  CuratedSetNotFoundError
> {
  return Result.pipe(
    resolveGrammarSource(deps, grammar.source, userId, language),
    Result.map(uniqueById),
  )
}

async function resolveGrammarSource(
  deps: EvaluateExercisePolicyDeps,
  source: ExercisePolicy.GrammarSource,
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<
  CuratedGrammarPoint.CuratedGrammarPoint[],
  CuratedSetNotFoundError
> {
  switch (source.type) {
    case 'selectedSets': {
      const selectedSets = await deps.findSelectedSetsByUserId({ userId })
      const setsWithItems = selectedSets
        .filter((set) => set.language === language)
        .map((set) => deps.findSetWithItemsById({ id: set.id }))

      return Result.pipe(
        Result.sequence(setsWithItems),
        Result.map((set) => set.flatMap((s) => s.grammarPoints)),
      )
    }
    case 'specificSets': {
      const setsWithItems = source.setIds.map((id) =>
        deps.findSetWithItemsById({ id }),
      )
      return Result.pipe(
        Result.sequence(setsWithItems),
        Result.map((set) => set.flatMap((s) => s.grammarPoints)),
      )
    }
  }
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)]
}

function uniqueById<T extends { id: unknown }>(items: T[]): T[] {
  return [...new Map(items.map((item) => [item.id, item])).values()]
}
