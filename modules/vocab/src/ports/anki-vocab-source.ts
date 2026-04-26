import type { Result } from '@praha/byethrow'
import type { InvalidLayoutError, VocabSourceUnavailableError } from '../errors'
import type { AvailableLayout } from '../models/available-layout'
import type { AvailableLayoutId } from '../models/available-layout-id'
import type { Deck } from '../models/deck'
import type { DeckId } from '../models/deck-id'
import type { VocabItem } from '../models/vocab-item'
import type { VocabSourceLayout } from '../models/vocab-source-layout'

type VocabItemsPage = {
  items: VocabItem[]
  totalCount: number
  hasMore: boolean
}

export type AnkiVocabSource = {
  getDecks(): Result.ResultAsync<Deck[], VocabSourceUnavailableError>
  getModelIdsForDeck(
    deckId: DeckId,
  ): Result.ResultAsync<AvailableLayoutId[], VocabSourceUnavailableError>
  getAvailableLayouts(): Result.ResultAsync<
    AvailableLayout[],
    VocabSourceUnavailableError
  >
  getVocabItems(
    layout: VocabSourceLayout,
    query: { deckId: DeckId; limit: number; offset: number },
  ): Result.ResultAsync<
    VocabItemsPage,
    VocabSourceUnavailableError | InvalidLayoutError
  >
}
