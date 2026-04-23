import { ValidationError } from '@lingua-hub/core'
import { Result } from '@praha/byethrow'
import { VocabSourceUnavailableError } from '../../../errors'
import * as AvailableLayout from '../../../models/available-layout'
import * as AvailableLayoutId from '../../../models/available-layout-id'
import type { VocabSource } from '../../../ports/vocab-source'
import type { AnkiDroidClient } from './anki-droid-adapter'

export function createGetAvailableLayouts(
  client: AnkiDroidClient,
): VocabSource['getAvailableLayouts'] {
  return async () => {
    const result = await client.getModels()

    if (Result.isFailure(result)) {
      if (result.error instanceof ValidationError) throw result.error
      return Result.fail(
        new VocabSourceUnavailableError(result.error.message, {
          cause: result.error,
        }),
      )
    }

    const layouts = result.value.models.map<AvailableLayout.AvailableLayout>((model) => ({
      id: AvailableLayoutId.availableLayoutIdSchema.parse(model.id),
      name: model.name,
      fields: model.fieldNames,
      sampleValues: {},
    }))

    return Result.succeed(layouts)
  }
}
