import { ValidationError } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import { VocabSourceUnavailableError } from '../../../errors'
import { deckSchema } from '../../../models/deck'
import type { AnkiVocabSource } from '../../../ports/anki-vocab-source'
import type { AnkiDroidClient } from './anki-droid-adapter'

export function createGetDecks(
  client: AnkiDroidClient,
): AnkiVocabSource['getDecks'] {
  return async () => {
    const result = await client.getDecks()

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

    return Result.succeed(result.value.decks.map((d) => deckSchema.parse(d)))
  }
}
