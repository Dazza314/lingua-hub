# Curated Content Repository

All curated read-only content — vocab items, grammar points, and sets — is exposed through a single `CuratedContentRepository` port rather than separate per-type ports.

## Decision

One port, one adapter. `CuratedContentRepository` owns all methods for reading curated content: `getCuratedVocabItems`, `getCuratedGrammarPoints`, `findSetsByLanguage`, `findSetWithItemsById`.

The port previously also held user set-selection methods (`findSelectedSetsByUserId`, `insertUserSetSelection`, `deleteUserSetSelection`). These were removed when the selected-sets feature was replaced by the per-skill set picker in `ExercisePolicy` (see `docs/design/exercise-policy-backend.md`).

## Why not separate ports

The initial implementation did have separate ports (`CuratedVocabRepository`, `CuratedGrammarPointRepository`). They were merged because:

- All curated content is read-only seed data with the same access characteristics (public read, no user writes). There is no scenario where you would want one without the other.
- The methods will almost always be consumed together — a command that fetches a set needs both vocab items and grammar points. Splitting the port would require injecting multiple dependencies for what is effectively one concern.
- A single adapter is simpler to construct and wire: one `SupabaseClient` instance, one factory object.

## Trade-offs accepted

- As curated content grows, the port will accumulate more methods. This is acceptable — all methods share the same access pattern and the same underlying data store.
- If curated content ever needed to be sourced from different backends (e.g. grammar from a different API), a split would be revisited. That is not a current or near-term requirement.
