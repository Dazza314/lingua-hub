# Exercise policy — backend storage

## Status

Plan A complete. Plan B (selected-sets removal) pending — scope captured below.

## Goal

Persist the user's exercise policy in the backend, per `(user, language)`, so it is
no longer passed from the client on every generate request.

## Model (final)

The `selectedSets | specificSets` discriminated union was collapsed — it was two UIs
and two storage mechanisms for one concept ("which curated sets feed my exercises").
The policy now holds flat, independent per-skill curated-set lists:

```
VocabPolicy    = { setIds: CuratedSetId[]; importedVocab: boolean }
GrammarPolicy  = { setIds: CuratedSetId[] }
ExercisePolicy = { vocab: VocabPolicy; grammar: GrammarPolicy }
```

- A policy is identified by `(userId, language)`; `language` is a port coordinate,
  not a field of the value object (like `userId`).
- `setIds` is a set: deduped on `parse`, may be empty (empty is a valid configured
  state, not an error).
- The read adapter substitutes `DEFAULT_EXERCISE_POLICY` (empty lists) on a missing
  row; the port read is non-nullable.

## Storage

One table `user_exercise_policy`, primary key `(user_id, language)`, set lists as
`uuid[]` columns (`vocab_set_ids`, `grammar_set_ids`) plus `imported_vocab`.

`upsert` is a single-row atomic write — the earlier "non-atomic upsert" open problem
is **resolved**. The array-column choice (no DB foreign key to `sets`) and its
consequences are recorded in `docs/adr/exercise-policy-set-storage.md`. A curated set
deleted after being added to a policy leaves a dangling ID;
`evaluate-exercise-policy` skips unresolvable IDs rather than hard-failing.

## Plan B — remove the orphaned selected-sets feature (pending)

After Plan A nothing reads selected sets; the feature is dead and should be removed.

- **Vocab module:** drop `findSelectedSetsByUserId`, `insertUserSetSelection`,
  `deleteUserSetSelection` from the `CuratedContentRepository` port
  (`ports/curated-content-repository.ts`); delete the adapter files
  `adapters/supabase/curated-content-repository/{find-selected-sets-by-user-id,
insert-user-set-selection,delete-user-set-selection}.ts` **and** remove their
  `create*` entries from the factory aggregator
  `adapters/supabase/curated-content-repository/supabase-curated-content-repository.ts`;
  delete commands `get-selected-sets-for-user`, `select-set`, `deselect-set`; update
  `modules/vocab/src/index.ts`. (All now unused after Plan A; no test files exist.)
- **App:** delete the `/sets` page directory (`apps/web/app/(app)/sets/`, incl.
  `_components/SetsView.tsx`), remove `selectSet`/`deselectSet` (and their now-unused
  command/factory imports) from `apps/web/app/actions.ts`, and remove the `/sets`
  entry from the nav (`apps/web/components/AppNav.tsx`).
- **DB:** new forward migration dropping `user_selected_sets` (created by
  `20260516000000_create_user_selected_sets.sql`); regenerate types.
- **Verify:** `pnpm typecheck && pnpm lint && pnpm test`.
- **Open product question:** the PolicyEditor now provides per-skill selection from
  the full catalogue, so the standalone `/sets` collection page is redundant —
  confirm there is no other reason to keep a catalogue-browsing page before deleting
  it. Also add a follow-up note to `docs/adr/curated-content-repository.md` (it states
  user selections live on that port; those methods are being removed).
