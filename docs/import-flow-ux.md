# Android Import Flow — UX Issues

## Current flow

1. Pick deck
2. Pick note type (all note types shown — no filtering)
3. Map fields

## Resolved issues

**1. Order** — fixed. Deck is now first.

**2. Filtering** — not yet implemented. Option (c) was chosen: flip the order and show all note types. Most users have 1–2 note types so this is acceptable for now.

## Filtering options (if revisited)

**(a) Add Kotlin plugin method** `getModelIdsForDeck(deckId)` — queries `mid` (model ID) for all notes in a deck, returns unique values. Clean, correct, but requires a Capacitor plugin change.

**(b) Approximate from first page** — call `getNotesWithCards` with the deck filter, collect unique `modelId` values from the result. No Kotlin changes, but incomplete if a deck has rare note types beyond the first 500 notes.

**(c) Skip filtering** ✓ implemented — flip the order and show all note types.
