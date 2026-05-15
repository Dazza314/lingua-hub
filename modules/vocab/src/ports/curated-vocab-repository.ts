import type { Language } from '@lingua-hub/core'
import type { CuratedVocabItem } from '../models/curated-vocab-item'

export type CuratedVocabRepository = {
  getCuratedVocabItems(params: {
    language: Language.Language
  }): Promise<CuratedVocabItem[]>
}
