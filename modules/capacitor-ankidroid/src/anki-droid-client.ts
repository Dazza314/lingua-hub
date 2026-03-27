import { registerPlugin } from '@capacitor/core'
import { Result } from '@praha/byethrow'
import { AnkiDroidBridgeError, ValidationError } from './errors'
import {
  AddNoteOptions,
  AddNoteResponse,
  CountNotesResponse,
  DecksResponse,
  ModelsResponse,
  NoteQuery,
  NoteWithCardsResponse,
  NotesPageResponse,
  PermissionStatusResponse,
} from './schemas'

/**
 * Minimal type for the untyped Capacitor bridge proxy.
 * Only declares method names — all return Promise<unknown>.
 * Real type safety comes from Zod parsing in the client below.
 */
type AnkiDroidBridge = {
  checkPermission(): Promise<unknown>
  requestPermission(): Promise<unknown>
  getDecks(): Promise<unknown>
  getModels(): Promise<unknown>
  getNotesWithCards(options?: unknown): Promise<unknown>
  getNoteWithCards(options: unknown): Promise<unknown>
  countNotes(options?: unknown): Promise<unknown>
  addNote(options: unknown): Promise<unknown>
}

const bridge = registerPlugin<AnkiDroidBridge>('AnkiDroid')

type AnkiDroidResult<T> = Result.ResultAsync<
  T,
  AnkiDroidBridgeError | ValidationError
>

function call<T>(
  bridgeCall: () => Promise<unknown>,
  parse: (raw: unknown) => Result.Result<T, ValidationError>,
): AnkiDroidResult<T> {
  return Result.pipe(
    Result.fn({
      try: bridgeCall,
      catch: (err) => new AnkiDroidBridgeError(String(err), { cause: err }),
    })(),
    Result.andThen(parse),
  )
}

/**
 * Typed client for the AnkiDroid Capacitor plugin.
 *
 * Wraps the untyped Capacitor bridge with Zod validation — every response
 * is parsed against its raw schema before being returned. This is the only
 * place where bridge data crosses into typed TypeScript.
 */
export const ankiDroidClient = {
  checkPermission(): AnkiDroidResult<PermissionStatusResponse.PermissionStatusResponse> {
    return call(() => bridge.checkPermission(), PermissionStatusResponse.parse)
  },

  requestPermission(): AnkiDroidResult<PermissionStatusResponse.PermissionStatusResponse> {
    return call(
      () => bridge.requestPermission(),
      PermissionStatusResponse.parse,
    )
  },

  getDecks(): AnkiDroidResult<DecksResponse.DecksResponse> {
    return call(() => bridge.getDecks(), DecksResponse.parse)
  },

  getModels(): AnkiDroidResult<ModelsResponse.ModelsResponse> {
    return call(() => bridge.getModels(), ModelsResponse.parse)
  },

  getNotesWithCards(
    options?: NoteQuery.NoteQuery,
  ): AnkiDroidResult<NotesPageResponse.NotesPageResponse> {
    return call(
      () => bridge.getNotesWithCards(options),
      NotesPageResponse.parse,
    )
  },

  getNoteWithCards(options: {
    noteId: string
  }): AnkiDroidResult<NoteWithCardsResponse.NoteWithCardsResponse> {
    return call(
      () => bridge.getNoteWithCards(options),
      NoteWithCardsResponse.parse,
    )
  },

  countNotes(options?: {
    deckId?: string
    modelId?: string
    modifiedSince?: number
  }): AnkiDroidResult<CountNotesResponse.CountNotesResponse> {
    return call(() => bridge.countNotes(options), CountNotesResponse.parse)
  },

  addNote(
    options: AddNoteOptions.AddNoteOptions,
  ): AnkiDroidResult<AddNoteResponse.AddNoteResponse> {
    return call(() => bridge.addNote(options), AddNoteResponse.parse)
  },
}
