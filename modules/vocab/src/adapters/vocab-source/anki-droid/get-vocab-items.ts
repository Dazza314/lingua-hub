import { ValidationError } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import { v5 as uuidv5 } from 'uuid'
import {
  InvalidLayoutError,
  VocabSourceUnavailableError,
} from '../../../errors'
import * as ImportedVocabId from '../../../models/imported-vocab-id'
import * as ImportedVocabItem from '../../../models/imported-vocab-item'
import type { AnkiVocabSource } from '../../../ports/anki-vocab-source'
import type { AnkiDroidClient } from './anki-droid-adapter'

// Dedicated namespace for deriving VocabIds from Anki note guids
const ANKI_VOCAB_ID_NAMESPACE = 'b4a1c6e2-3f8d-4a2b-9c7e-1d5f0e8b3a6c'

export function createGetVocabItems(
  client: AnkiDroidClient,
): AnkiVocabSource['getVocabItems'] {
  return async (layout, query) => {
    const result = await client.getNotesWithCards({
      modelId: layout.id,
      deckId: query.deckId,
      limit: query.limit,
      offset: query.offset,
    })

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

    return Result.pipe(
      result.value.data.reduce<
        Result.Result<ImportedVocabItem.ImportedVocabItem[], InvalidLayoutError>
      >((acc, { note }) => {
        if (Result.isFailure(acc)) {
          return acc
        }

        const term = note.fields[layout.termField]

        if (term === undefined) {
          return Result.fail(
            new InvalidLayoutError(`Note is missing a required field (term)`, {
              context: note,
            }),
          )
        }

        return Result.succeed([
          ...acc.value,
          {
            id: ImportedVocabId.importedVocabIdSchema.parse(
              uuidv5(note.guid, ANKI_VOCAB_ID_NAMESPACE),
            ),
            language: layout.language,
            term,
          },
        ])
      }, Result.succeed([])),

      Result.map((items) => ({
        items,
        totalCount: result.value.totalCount,
        hasMore: result.value.hasMore,
      })),
    )
  }
}
