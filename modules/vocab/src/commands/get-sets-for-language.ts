import type { Language } from '@lingua-hub/core'
import type { CuratedSet } from '../models/index'
import type { CuratedContentRepository } from '../ports/curated-content-repository'

type GetSetsForLanguageDeps = {
  findSetsByLanguage: CuratedContentRepository['findSetsByLanguage']
}

export function makeGetSetsForLanguage(deps: GetSetsForLanguageDeps) {
  return async (params: {
    language: Language.Language
  }): Promise<CuratedSet.CuratedSet[]> => {
    return deps.findSetsByLanguage(params)
  }
}
