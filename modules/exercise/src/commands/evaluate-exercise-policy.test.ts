import { Language, UserId } from '@lingua-hub/core'
import type {
  CuratedContentRepository,
  ImportedVocabRepository,
} from '@lingua-hub/vocab'
import {
  CuratedGrammarPoint,
  CuratedSetId,
  CuratedSetNotFoundError,
  CuratedSetWithItems,
  ImportedVocabItem,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { describe, expect, it } from 'vitest'
import * as ExercisePolicy from '../models/exercise-policy'
import { evaluateExercisePolicy } from './evaluate-exercise-policy'

const USER_ID = UserId.userIdSchema.parse(
  '00000000-0000-4000-8000-000000000000',
)
const LANGUAGE = Language.languageSchema.parse('ja')

let idCounter = 0
function nextId(): string {
  idCounter++
  return `00000000-0000-4000-8000-${idCounter.toString(16).padStart(12, '0')}`
}

function makeSetId(): CuratedSetId.CuratedSetId {
  return nextId() as CuratedSetId.CuratedSetId
}

function makeImportedVocabItem(
  term: string,
): ImportedVocabItem.ImportedVocabItem {
  return ImportedVocabItem.dangerouslyCast({
    id: nextId(),
    language: LANGUAGE,
    term,
  })
}

function makeGrammarPoint(
  overrides: Partial<{ title: string; explanation: string }> = {},
): CuratedGrammarPoint.CuratedGrammarPoint {
  return CuratedGrammarPoint.dangerouslyCast({
    id: nextId(),
    language: LANGUAGE,
    title: 'Grammar Point',
    explanation: 'Some explanation',
    ...overrides,
  })
}

function makeCuratedSetWithItems(
  id: CuratedSetId.CuratedSetId,
  vocabTerms: string[],
  grammarPoints: CuratedGrammarPoint.CuratedGrammarPoint[] = [],
  language = LANGUAGE,
): CuratedSetWithItems.CuratedSetWithItems {
  return CuratedSetWithItems.dangerouslyCast({
    id,
    language,
    title: 'Test Set',
    category: 'Test category',
    vocabItems: vocabTerms.map((term) => ({ id: nextId(), language, term })),
    grammarPoints,
  })
}

function makeGetImportedVocabItems(
  items: ImportedVocabItem.ImportedVocabItem[],
): ImportedVocabRepository['getImportedVocabItems'] {
  return () => Promise.resolve(items)
}

function makeFindSetWithItemsById(
  sets: CuratedSetWithItems.CuratedSetWithItems[],
): CuratedContentRepository['findSetWithItemsById'] {
  return ({ id }) => {
    const set = sets.find((s) => s.id === id)
    return set
      ? Promise.resolve(Result.succeed(set))
      : Promise.resolve(Result.fail(new CuratedSetNotFoundError('not found')))
  }
}

const NO_RESULTS_DEPS = {
  getImportedVocabItems: makeGetImportedVocabItems([]),
  findSetWithItemsById: makeFindSetWithItemsById([]),
}

function policy(
  vocab: { setIds: CuratedSetId.CuratedSetId[]; importedVocab?: boolean },
  grammarSetIds: CuratedSetId.CuratedSetId[] = [],
): ExercisePolicy.ExercisePolicy {
  return ExercisePolicy.dangerouslyCast({
    vocab: {
      setIds: vocab.setIds,
      importedVocab: vocab.importedVocab ?? false,
    },
    grammar: { setIds: grammarSetIds },
  })
}

describe('evaluateExercisePolicy', () => {
  it('returns empty arrays when the policy has no sets', async () => {
    const result = await evaluateExercisePolicy(NO_RESULTS_DEPS)({
      policy: policy({ setIds: [] }),
      userId: USER_ID,
      language: LANGUAGE,
    })

    expect(result.vocabTerms).toEqual([])
    expect(result.grammarPoints).toEqual([])
  })

  describe('vocab', () => {
    it('returns terms from the policy sets', async () => {
      const setId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_RESULTS_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, ['cat', 'dog']),
        ]),
      })({
        policy: policy({ setIds: [setId] }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.vocabTerms).toEqual(['cat', 'dog'])
    })

    it('includes imported vocab when enabled', async () => {
      const result = await evaluateExercisePolicy({
        ...NO_RESULTS_DEPS,
        getImportedVocabItems: makeGetImportedVocabItems([
          makeImportedVocabItem('apple'),
          makeImportedVocabItem('banana'),
        ]),
      })({
        policy: policy({ setIds: [], importedVocab: true }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.vocabTerms).toEqual(['apple', 'banana'])
    })
  })

  describe('grammar', () => {
    it('returns grammar points from the policy sets', async () => {
      const setId = makeSetId()
      const grammarPoint = makeGrammarPoint({ title: 'て-form' })
      const result = await evaluateExercisePolicy({
        ...NO_RESULTS_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, [], [grammarPoint]),
        ]),
      })({
        policy: policy({ setIds: [] }, [setId]),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.grammarPoints).toEqual([grammarPoint])
    })
  })

  describe('unresolvable set IDs are skipped', () => {
    it('skips a missing set and still resolves the rest', async () => {
      const presentId = makeSetId()
      const missingId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_RESULTS_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(presentId, ['hello']),
        ]),
      })({
        policy: policy({ setIds: [missingId, presentId] }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.vocabTerms).toEqual(['hello'])
    })

    it('returns an empty result when every set is unresolvable', async () => {
      const result = await evaluateExercisePolicy(NO_RESULTS_DEPS)({
        policy: policy({ setIds: [makeSetId()] }, [makeSetId()]),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.vocabTerms).toEqual([])
      expect(result.grammarPoints).toEqual([])
    })
  })

  describe('deduplication', () => {
    it('deduplicates vocab terms across sets and imported vocab', async () => {
      const setId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_RESULTS_DEPS,
        getImportedVocabItems: makeGetImportedVocabItems([
          makeImportedVocabItem('shared'),
        ]),
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, ['shared', 'unique']),
        ]),
      })({
        policy: policy({ setIds: [setId], importedVocab: true }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.vocabTerms).toEqual(['shared', 'unique'])
    })

    it('deduplicates grammar points by id across multiple sets', async () => {
      const setId1 = makeSetId()
      const setId2 = makeSetId()
      const grammarPoint = makeGrammarPoint({ title: 'Shared Grammar' })
      const result = await evaluateExercisePolicy({
        ...NO_RESULTS_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId1, [], [grammarPoint]),
          makeCuratedSetWithItems(setId2, [], [grammarPoint]),
        ]),
      })({
        policy: policy({ setIds: [] }, [setId1, setId2]),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.grammarPoints).toHaveLength(1)
      expect(result.grammarPoints[0]).toEqual(grammarPoint)
    })
  })
})
