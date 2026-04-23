import type { ankiDroidClient } from '@lingua-hub/capacitor-ankidroid'
import type { VocabSource } from '../../../ports/vocab-source'
import { createGetAvailableLayouts } from './get-available-layouts'
import { createGetVocabItems } from './get-vocab-items'

export type AnkiDroidClient = typeof ankiDroidClient

export function createAnkiDroidAdapter(client: AnkiDroidClient): VocabSource {
  return {
    getAvailableLayouts: createGetAvailableLayouts(client),
    getVocabItems: createGetVocabItems(client),
  }
}
