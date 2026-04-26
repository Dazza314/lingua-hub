import { ValidationError } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import { VocabSourceUnavailableError } from '../../../errors'
import { availableLayoutIdSchema } from '../../../models/available-layout-id'
import type { AnkiVocabSource } from '../../../ports/anki-vocab-source'
import type { AnkiDroidClient } from './anki-droid-adapter'

export function createGetModelIdsForDeck(
  client: AnkiDroidClient,
): AnkiVocabSource['getModelIdsForDeck'] {
  return async (deckId) => {
    const result = await client.getModelIdsForDeck({ deckId })

    if (Result.isFailure(result)) {
      if (result.error instanceof ValidationError) {
        throw result.error
      }
      return Result.fail(
        new VocabSourceUnavailableError(result.error.message, {
          cause: result.error,
        }),
      )
    }

    return Result.succeed(
      result.value.modelIds.map((id) => availableLayoutIdSchema.parse(id)),
    )
  }
}
