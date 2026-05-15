import type { ankiDroidClient } from '@lingua-hub/capacitor-ankidroid'
import type { AnkiVocabSource } from '../../../ports/anki-vocab-source'
import { createGetAvailableLayouts } from './get-available-layouts'
import { createGetDecks } from './get-decks'
import { createGetModelIdsForDeck } from './get-model-ids-for-deck'
import { createGetVocabItems } from './get-vocab-items'

export type AnkiDroidClient = typeof ankiDroidClient

export function createAnkiDroidAdapter(
  client: AnkiDroidClient,
): AnkiVocabSource {
  return {
    getDecks: createGetDecks(client),
    getModelIdsForDeck: createGetModelIdsForDeck(client),
    getAvailableLayouts: createGetAvailableLayouts(client),
    getVocabItems: createGetVocabItems(client),
  }
}
