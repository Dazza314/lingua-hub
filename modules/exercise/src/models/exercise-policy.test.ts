import { CuratedSetId } from '@lingua-hub/vocab'
import { describe, expect, it } from 'vitest'
import { fromSet } from './exercise-policy'

const SET_ID = CuratedSetId.curatedSetIdSchema.parse(
  '00000000-0000-4000-8000-000000000001',
)

describe('ExercisePolicy.fromSet', () => {
  it('includes the set id in both', () => {
    const policy = fromSet({ id: SET_ID })
    expect(policy).toEqual({
      vocab: { setIds: [SET_ID], importedVocab: false },
      grammar: { setIds: [SET_ID] },
    })
  })
})
