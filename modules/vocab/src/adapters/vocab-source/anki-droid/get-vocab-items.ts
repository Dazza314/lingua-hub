import { ValidationError } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import { v5 as uuidv5 } from 'uuid'
import {
  InvalidLayoutError,
  VocabSourceUnavailableError,
} from '../../../errors'
import * as VocabId from '../../../models/vocab-id'
import * as VocabItem from '../../../models/vocab-item'
import * as VocabSourceLayout from '../../../models/vocab-source-layout'
import type { VocabSource } from '../../../ports/vocab-source'
import type { AnkiDroidClient } from './anki-droid-adapter'

// Dedicated namespace for deriving VocabIds from Anki note guids
const ANKI_VOCAB_ID_NAMESPACE = 'b4a1c6e2-3f8d-4a2b-9c7e-1d5f0e8b3a6c'

export function createGetVocabItems(
  client: AnkiDroidClient,
): VocabSource['getVocabItems'] {
  return async (layout: VocabSourceLayout.VocabSourceLayout) => {
    const result = await client.getNotesWithCards({ modelId: layout.id })

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

    const termMapping = layout.mappings.find((m) => m.target === 'term')
    const definitionMapping = layout.mappings.find(
      (m) => m.target === 'definition',
    )
    const readingMapping = layout.mappings.find((m) => m.target === 'reading')

    return result.value.data.reduce<
      Result.Result<VocabItem.VocabItem[], InvalidLayoutError>
    >((acc, { note }) => {
      if (Result.isFailure(acc)) {
        return acc
      }

      const term = termMapping
        ? note.fields[termMapping.sourceField]
        : undefined
      const definition = definitionMapping
        ? note.fields[definitionMapping.sourceField]
        : undefined

      if (term === undefined || definition === undefined) {
        return Result.fail(
          new InvalidLayoutError(
            `Note ${note.guid} is missing a required field (term or definition)`,
          ),
        )
      }

      return Result.succeed([
        ...acc.value,
        {
          id: VocabId.vocabIdSchema.parse(
            uuidv5(note.guid, ANKI_VOCAB_ID_NAMESPACE),
          ),
          language: layout.language,
          term,
          definition,
          reading: readingMapping
            ? note.fields[readingMapping.sourceField]
            : undefined,
        },
      ])
    }, Result.succeed([]))
  }
}
