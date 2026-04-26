# Issue: AnkiDroid notes URI ignores `search` query parameter

## Problem

`getModelIdsForDeck` returns all note-type IDs in the AnkiDroid database, not just those
present in the selected deck. The layout picker therefore shows every note type the user
has, regardless of which deck they selected.

## Root cause

`getModelIdsForDeck` queries the notes URI with a `search` query parameter:

```
content://com.ichi2.anki.flashcards/notes?search=deck%3A%22Mined%22
```

Logcat confirmed the URI is constructed correctly (deck name lookup works after the fix in
the previous `fix-ankidroid-deck-filter` doc). However, the AnkiDroid ContentProvider
silently ignores the `search` parameter on the notes URI — the cursor returns all 1537
notes across all decks, yielding all 4 note-type IDs instead of the 1 that belongs to the
selected deck.

## Fix

The notes URI cannot be relied on for deck filtering. Instead, verify deck membership by
checking the cards for a sample of notes per unique model ID — cards are fetched via
`content://$AUTHORITY/notes/$noteId/cards` and do expose `deck_id`.

For each unique model ID found in the (unfiltered) notes cursor, check the cards of the
first few notes of that model. If any card belongs to the target deck, include the model
ID. Cap the number of card checks per model to keep the total query count small (models ×
cap, typically low single digits).

This relies on the observation that in practice a given note type is usually confined to
one deck, so the first note encountered for a model type is very likely to confirm or
reject it with a single card lookup. The cap guards against the rarer case where a model's
notes are spread across decks.

## Scope

All changes in `AnkiDroidPlugin.kt` (`getModelIdsForDeck` method and a new private helper).
No TypeScript or schema changes required.
