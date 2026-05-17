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
  grammarPoints: CuratedGrammarPoint[]
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

function resolveVocabTerms(
  deps: EvaluateExercisePolicyDeps,
  sources: ExercisePolicy.VocabSource[],
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<string[], CuratedSetNotFoundError> {
  return Result.pipe(
    Result.sequence(
      sources.map((source) =>
        resolveVocabSource(deps, source, userId, language),
      ),
    ),
    Result.map((termArrays) => unique(termArrays.flat())),
  )
}

async function resolveVocabSource(
  deps: EvaluateExercisePolicyDeps,
  source: ExercisePolicy.VocabSource,
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<string[], CuratedSetNotFoundError> {
  switch (source.type) {
    case 'selected_sets': {
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
    case 'specific_sets': {
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
    case 'imported_vocab': {
      const importedVocabItems = await deps.getImportedVocabItems({
        userId,
        language,
      })
      return Result.succeed(importedVocabItems.map(({ term }) => term))
    }
  }
}

function resolveGrammarPoints(
  deps: EvaluateExercisePolicyDeps,
  sources: ExercisePolicy.GrammarSource[],
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<CuratedGrammarPoint[], CuratedSetNotFoundError> {
  const curatedGrammarPointsSets = sources.map((source) =>
    resolveGrammarSource(deps, source, userId, language),
  )
  return Result.pipe(
    Result.sequence(curatedGrammarPointsSets),
    Result.map((pointArrays) => uniqueById(pointArrays.flat())),
  )
}

async function resolveGrammarSource(
  deps: EvaluateExercisePolicyDeps,
  source: ExercisePolicy.GrammarSource,
  userId: UserId.UserId,
  language: Language.Language,
): Result.ResultAsync<CuratedGrammarPoint[], CuratedSetNotFoundError> {
  switch (source.type) {
    case 'selected_sets': {
      const selectedSets = await deps.findSelectedSetsByUserId({ userId })
      const setsWithItems = selectedSets
        .filter((set) => set.language === language)
        .map((set) => deps.findSetWithItemsById({ id: set.id }))

      return Result.pipe(
        Result.sequence(setsWithItems),
        Result.map((set) => set.flatMap((s) => s.grammarPoints)),
      )
    }
    case 'specific_sets': {
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
