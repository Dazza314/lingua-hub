import { useRunOnMount } from '@/hooks/use-run-on-mount'
import { createClient } from '@/lib/supabase/client'
import { ankiDroidClient } from '@lingua-hub/capacitor-ankidroid'
import { Language, makeParse, UserId } from '@lingua-hub/core'
import {
  createAnkiDroidAdapter,
  importVocab,
  Models,
  supabaseVocabRepositoryFactories,
} from '@lingua-hub/vocab'
import { Result } from '@praha/byethrow'
import { useReducer } from 'react'

type State =
  | { phase: 'checking-permission' }
  | { phase: 'permission-denied' }
  | { phase: 'loading-layouts' }
  | { phase: 'layout-error'; message: string }
  | {
      phase: 'picking-layout'
      layouts: Models.AvailableLayout.AvailableLayout[]
    }
  | {
      phase: 'mapping'
      layouts: Models.AvailableLayout.AvailableLayout[]
      layout: Models.AvailableLayout.AvailableLayout
      term: string
      definition: string
      reading: string
    }
  | { phase: 'syncing' }
  | { phase: 'sync-success'; count: number }
  | { phase: 'sync-error'; message: string }

type Action =
  | { type: 'permission-granted' }
  | { type: 'permission-denied' }
  | {
      type: 'layouts-loaded'
      layouts: Models.AvailableLayout.AvailableLayout[]
    }
  | { type: 'layout-error'; message: string }
  | { type: 'select-layout'; layout: Models.AvailableLayout.AvailableLayout }
  | { type: 'set-term'; value: string }
  | { type: 'set-definition'; value: string }
  | { type: 'set-reading'; value: string }
  | { type: 'sync-start' }
  | { type: 'sync-success'; count: number }
  | { type: 'sync-error'; message: string }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'permission-granted':
      return { phase: 'loading-layouts' }
    case 'permission-denied':
      return { phase: 'permission-denied' }
    case 'layouts-loaded':
      return { phase: 'picking-layout', layouts: action.layouts }
    case 'layout-error':
      return { phase: 'layout-error', message: action.message }
    case 'select-layout':
      if (state.phase !== 'picking-layout') {
        return state
      }
      return {
        phase: 'mapping',
        layouts: state.layouts,
        layout: action.layout,
        term: '',
        definition: '',
        reading: '',
      }
    case 'set-term':
      if (state.phase !== 'mapping') {
        return state
      }
      return { ...state, term: action.value }
    case 'set-definition':
      if (state.phase !== 'mapping') {
        return state
      }
      return { ...state, definition: action.value }
    case 'set-reading':
      if (state.phase !== 'mapping') {
        return state
      }
      return { ...state, reading: action.value }
    case 'sync-start':
      return { phase: 'syncing' }
    case 'sync-success':
      return { phase: 'sync-success', count: action.count }
    case 'sync-error':
      return { phase: 'sync-error', message: action.message }
    case 'reset':
      return { phase: 'checking-permission' }
  }
}

const adapter = createAnkiDroidAdapter(ankiDroidClient)
const TARGET_LANGUAGE = Language.languageSchema.parse('ja')
const parseUserId = makeParse(UserId.userIdSchema)

export function useImportPage() {
  const [state, dispatch] = useReducer(reducer, {
    phase: 'checking-permission',
  })

  async function loadLayouts() {
    dispatch({ type: 'permission-granted' })
    const result = await adapter.getAvailableLayouts()
    if (Result.isFailure(result)) {
      dispatch({ type: 'layout-error', message: result.error.message })
      return
    }
    dispatch({ type: 'layouts-loaded', layouts: result.value })
  }

  async function checkPermission() {
    const result = await ankiDroidClient.checkPermission()
    if (Result.isFailure(result) || !result.value.granted) {
      dispatch({ type: 'permission-denied' })
    } else {
      await loadLayouts()
    }
  }

  async function requestPermission() {
    const result = await ankiDroidClient.requestPermission()
    if (Result.isSuccess(result) && result.value.granted) {
      await loadLayouts()
    } else {
      dispatch({ type: 'permission-denied' })
    }
  }

  async function sync() {
    if (state.phase !== 'mapping') {
      return
    }
    if (!state.term || !state.definition) {
      return
    }

    const mappings: Models.VocabFieldMapping.VocabFieldMapping[] = [
      { sourceField: state.term, target: 'term' },
      { sourceField: state.definition, target: 'definition' },
      ...(state.reading
        ? [{ sourceField: state.reading, target: 'reading' as const }]
        : []),
    ]

    const layout: Models.VocabSourceLayout.VocabSourceLayout = {
      id: state.layout.id,
      name: state.layout.name,
      fields: state.layout.fields,
      language: TARGET_LANGUAGE,
      mappings,
    }

    dispatch({ type: 'sync-start' })

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      dispatch({ type: 'sync-error', message: 'Not authenticated' })
      return
    }

    const userIdResult = parseUserId(user.id)
    if (Result.isFailure(userIdResult)) {
      dispatch({ type: 'sync-error', message: 'Invalid user session' })
      return
    }

    const result = await importVocab({
      getVocabItems: adapter.getVocabItems,
      upsertVocabItems:
        supabaseVocabRepositoryFactories.createUpsertVocabItems(supabase),
    })({ userId: userIdResult.value, layout })

    if (Result.isFailure(result)) {
      dispatch({ type: 'sync-error', message: result.error.message })
      return
    }

    dispatch({ type: 'sync-success', count: result.value.count })
  }

  function selectLayout(layout: Models.AvailableLayout.AvailableLayout) {
    dispatch({ type: 'select-layout', layout })
  }

  function back() {
    if (state.phase !== 'mapping') {
      return
    }
    dispatch({ type: 'layouts-loaded', layouts: state.layouts })
  }

  function setTerm(value: string) {
    dispatch({ type: 'set-term', value })
  }
  function setDefinition(value: string) {
    dispatch({ type: 'set-definition', value })
  }
  function setReading(value: string) {
    dispatch({ type: 'set-reading', value })
  }
  function reset() {
    dispatch({ type: 'reset' })
  }

  useRunOnMount(() => void checkPermission())

  return {
    state,
    requestPermission,
    selectLayout,
    back,
    setTerm,
    setDefinition,
    setReading,
    sync,
    reset,
  }
}
