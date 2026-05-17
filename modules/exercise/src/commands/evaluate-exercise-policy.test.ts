import { Language, UserId } from '@lingua-hub/core'
import type {
  CuratedContentRepository,
  ImportedVocabRepository,
} from '@lingua-hub/vocab'
import {
  CuratedGrammarPoint,
  CuratedSet,
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
const OTHER_LANGUAGE = Language.languageSchema.parse('en')

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

function makeCuratedSet(
  id: CuratedSetId.CuratedSetId,
  language = LANGUAGE,
): CuratedSet.CuratedSet {
  return CuratedSet.dangerouslyCast({ id, language, title: 'Test Set' })
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
    vocabItems: vocabTerms.map((term) => ({ id: nextId(), language, term })),
    grammarPoints,
  })
}

function makeGetImportedVocabItems(
  items: ImportedVocabItem.ImportedVocabItem[],
): ImportedVocabRepository['getImportedVocabItems'] {
  return () => Promise.resolve(items)
}

function makeFindSelectedSetsByUserId(
  sets: CuratedSet.CuratedSet[],
): CuratedContentRepository['findSelectedSetsByUserId'] {
  return () => Promise.resolve(sets)
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

const NO_SOURCES_DEPS = {
  getImportedVocabItems: makeGetImportedVocabItems([]),
  findSelectedSetsByUserId: makeFindSelectedSetsByUserId([]),
  findSetWithItemsById: makeFindSetWithItemsById([]),
}

describe('evaluateExercisePolicy', () => {
  it('returns empty arrays when the policy has no sources', async () => {
    const result = await evaluateExercisePolicy(NO_SOURCES_DEPS)({
      policy: { vocab: [], grammar: [] },
      userId: USER_ID,
      language: LANGUAGE,
    })

    expect(result.type).toBe('Success')
    if (result.type === 'Success') {
      expect(result.value.vocabTerms).toEqual([])
      expect(result.value.grammarPoints).toEqual([])
    }
  })

  describe('vocab: imported_vocab', () => {
    it('returns terms from the imported vocab repo', async () => {
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        getImportedVocabItems: makeGetImportedVocabItems([
          makeImportedVocabItem('apple'),
          makeImportedVocabItem('banana'),
        ]),
      })({
        policy: { vocab: [{ type: 'imported_vocab' }], grammar: [] },
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.vocabTerms).toEqual(['apple', 'banana'])
      }
    })
  })

  describe('vocab: selected_sets', () => {
    it('returns terms from selected sets matching the target language', async () => {
      const setId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        findSelectedSetsByUserId: makeFindSelectedSetsByUserId([
          makeCuratedSet(setId),
        ]),
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, ['hello', 'world']),
        ]),
      })({
        policy: { vocab: [{ type: 'selected_sets' }], grammar: [] },
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.vocabTerms).toEqual(['hello', 'world'])
      }
    })

    it('ignores selected sets for other languages', async () => {
      const setId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        findSelectedSetsByUserId: makeFindSelectedSetsByUserId([
          makeCuratedSet(setId, OTHER_LANGUAGE),
        ]),
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, ['hello'], [], OTHER_LANGUAGE),
        ]),
      })({
        policy: { vocab: [{ type: 'selected_sets' }], grammar: [] },
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.vocabTerms).toEqual([])
      }
    })
  })

  describe('vocab: specific_sets', () => {
    it('returns terms from the specified sets', async () => {
      const setId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, ['cat', 'dog']),
        ]),
      })({
        policy: ExercisePolicy.dangerouslyCast({
          vocab: [{ type: 'specific_sets', setIds: [setId] }],
          grammar: [],
        }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.vocabTerms).toEqual(['cat', 'dog'])
      }
    })

    it('returns CuratedSetNotFoundError when a specified set does not exist', async () => {
      const result = await evaluateExercisePolicy(NO_SOURCES_DEPS)({
        policy: ExercisePolicy.dangerouslyCast({
          vocab: [{ type: 'specific_sets', setIds: [makeSetId()] }],
          grammar: [],
        }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Failure')
      if (result.type === 'Failure') {
        expect(result.error).toBeInstanceOf(CuratedSetNotFoundError)
      }
    })
  })

  describe('grammar: selected_sets', () => {
    it('returns grammar points from selected sets matching the target language', async () => {
      const setId = makeSetId()
      const grammarPoint = makeGrammarPoint({ title: 'Polite form' })
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        findSelectedSetsByUserId: makeFindSelectedSetsByUserId([
          makeCuratedSet(setId),
        ]),
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, [], [grammarPoint]),
        ]),
      })({
        policy: { vocab: [], grammar: [{ type: 'selected_sets' }] },
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.grammarPoints).toEqual([grammarPoint])
      }
    })
  })

  describe('grammar: specific_sets', () => {
    it('returns grammar points from the specified sets', async () => {
      const setId = makeSetId()
      const grammarPoint = makeGrammarPoint({ title: 'て-form' })
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, [], [grammarPoint]),
        ]),
      })({
        policy: ExercisePolicy.dangerouslyCast({
          vocab: [],
          grammar: [{ type: 'specific_sets', setIds: [setId] }],
        }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.grammarPoints).toEqual([grammarPoint])
      }
    })
  })

  describe('deduplication', () => {
    it('deduplicates vocab terms across multiple sources', async () => {
      const setId = makeSetId()
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        getImportedVocabItems: makeGetImportedVocabItems([
          makeImportedVocabItem('shared'),
        ]),
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId, ['shared', 'unique']),
        ]),
      })({
        policy: ExercisePolicy.dangerouslyCast({
          vocab: [
            { type: 'imported_vocab' },
            { type: 'specific_sets', setIds: [setId] },
          ],
          grammar: [],
        }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.vocabTerms).toEqual(['shared', 'unique'])
      }
    })

    it('deduplicates grammar points by id across multiple sources', async () => {
      const setId1 = makeSetId()
      const setId2 = makeSetId()
      const grammarPoint = makeGrammarPoint({ title: 'Shared Grammar' })
      const result = await evaluateExercisePolicy({
        ...NO_SOURCES_DEPS,
        findSetWithItemsById: makeFindSetWithItemsById([
          makeCuratedSetWithItems(setId1, [], [grammarPoint]),
          makeCuratedSetWithItems(setId2, [], [grammarPoint]),
        ]),
      })({
        policy: ExercisePolicy.dangerouslyCast({
          vocab: [],
          grammar: [{ type: 'specific_sets', setIds: [setId1, setId2] }],
        }),
        userId: USER_ID,
        language: LANGUAGE,
      })

      expect(result.type).toBe('Success')
      if (result.type === 'Success') {
        expect(result.value.grammarPoints).toHaveLength(1)
        expect(result.value.grammarPoints[0]).toEqual(grammarPoint)
      }
    })
  })
})
