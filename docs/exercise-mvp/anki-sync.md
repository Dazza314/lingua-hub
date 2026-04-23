# anki-sync

Sync the user's AnkiDroid vocab into Supabase so the exercise generator has items to work with.

## Flow

1. User opens the sync page on Android
2. App requests AnkiDroid permission (if not already granted)
3. App fetches available Anki models and presents them as layout options
4. User picks a model and maps its fields to vocab targets (term, definition, reading)
5. User taps Sync — app reads notes from AnkiDroid and upserts them into Supabase

## Implementation steps

| Step | Description | Depends on |
| ---- | ----------- | ---------- |
| [`ankidroid-adapter`](#ankidroid-adapter) | Implement `AnkiDroidAdapter` — `getAvailableLayouts` + `getVocabItems` | `capacitor-ankidroid` | done |
| [`sync-vocab-command`](#sync-vocab-command) | `syncVocab` command in `modules/vocab` — fetch from source, upsert to repo | `ankidroid-adapter` |
| [`sync-ui`](#sync-ui) | `/sync` page in `apps/web` — permission, layout picker, field mapping, sync trigger | `sync-vocab-command` |

---

## ankidroid-adapter

Implement the two stub methods on `AnkiDroidAdapter` in
`modules/vocab/src/adapters/vocab-source/anki-droid/anki-droid-adapter.ts`.

**`getAvailableLayouts()`**

- Call `ankiDroidClient.getModels()` to get all Anki note types
- Map each model to `AvailableLayout` — `id` from model id, `name` from model name, `fields` from model field names
- Fetch a sample note per model for `sampleValues` (best-effort — omit field if no notes exist)

**`getVocabItems(layout: VocabSourceLayout)`**

- Call `ankiDroidClient.getNotesWithCards({ modelId: layout.id })` to get all notes for the model
- For each note, apply `layout.mappings` to extract `term`, `definition`, and optional `reading` from the note's fields
- `id` is the Anki note id (already a string)
- `language` comes from `layout.language`
- Return `InvalidLayoutError` if a required mapped field is missing from a note

The adapter takes `ankiDroidClient` as a constructor argument.

---

## sync-vocab-command

Add `syncVocab` to `modules/vocab/src/commands/sync-vocab.ts`.

```ts
syncVocab(deps: {
  vocabSource: VocabSource
  upsertVocabItems: VocabRepository['upsertVocabItems']
}): (params: {
  userId: UserId
  layout: VocabSourceLayout
}) => ResultAsync<void, VocabSourceUnavailableError | InvalidLayoutError>
```

- Calls `vocabSource.getVocabItems(layout)`
- On success, calls `upsertVocabItems(userId, items)`

No deletion for MVP — sync is append/update only.

---

## sync-ui

A `/sync` page in `apps/web`, inside the `(app)` authenticated route group.

### Permission gate

On mount, call `ankiDroidClient.checkPermission()`. If not granted, show a prompt and call `requestPermission()`. If denied, show an error state — sync is not possible without it.

This is Capacitor-only. On web (non-Android), the page should show a "only available on Android" message.

### Layout picker

- Fetch available layouts via `AnkiDroidAdapter.getAvailableLayouts()`
- Display as a list — user selects one
- Show the model's field names with sample values to help with mapping

### Field mapping

For the selected layout, render a mapping UI:

- **Term** (required) — select field
- **Definition** (required) — select field  
- **Reading** (optional) — select field or "none"
- **Language** — select from supported languages (Japanese only for MVP)

No persistence for MVP — mapping is re-configured each session.

### Sync trigger

- "Sync" button calls `syncVocab` with the configured `VocabSourceLayout`
- Show item count on success
- Show error message on failure

### Nav

Add a "Sync" link to the nav bar.

## Depends on

- `modules/capacitor-ankidroid` ✅
- `VocabRepository` (Supabase adapter) ✅
- `VocabSource` port ✅
