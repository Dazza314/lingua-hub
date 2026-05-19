# ADR — Exercise policy stores curated-set IDs as array columns

## Status

Accepted

## Context

An exercise policy records, per skill (vocab, grammar), which curated sets feed a
user's generated exercises, plus an `imported_vocab` toggle. It is a per-`(user,
language)` singleton. The set lists are a many-to-many between a policy and `sets`.

The relationally-normalised model is junction tables (`..._vocab_sets`,
`..._grammar_sets`) with `set_id` foreign keys to `sets` and a foreign key to the
parent policy. That enforces set-membership uniqueness (via PK) and referential
integrity (no dangling IDs; a deleted set cascades out) in the database.

The decisive constraint is adapter correctness, not consumer preference. The
Supabase client has no client-side transactions: every `.from().insert/.delete/.upsert`
is a separate PostgREST round trip. Writing a policy under the junction model is
parent-row upsert plus a replace of two child tables — three statements across three
tables — which cannot be made atomic from the client. A correct (atomic) junction
adapter would _require_ moving the write into a `plpgsql` function called via
`client.rpc(...)`, splitting persistence logic across TypeScript and SQL and adding a
stored procedure to maintain. A junction adapter without that is knowingly
incorrect (partial writes / permanent inconsistency on a mid-write failure).

## Decision

Store the set lists as `uuid[]` columns on a single `user_exercise_policy` row:
`vocab_set_ids`, `grammar_set_ids`, `imported_vocab`, keyed by
`primary key (user_id, language)`.

`upsert` is a single-row `INSERT … ON CONFLICT (user_id, language) DO UPDATE` — atomic
by construction, one round trip, a trivially correct adapter with the plain Supabase
client and no procedural SQL.

Referential integrity and set-membership uniqueness are **not** enforced by the
database. They are application invariants enforced at the `parse` boundary: the
`ExercisePolicy` model dedupes `setIds` on parse, and the only writer (the
`saveExercisePolicy` server action) builds IDs from the curated catalogue and runs
`ExercisePolicy.parse` before persisting.

## Consequences

- The DB cannot guarantee a stored `set_id` denotes a real `sets` row, and a deleted
  curated set is not auto-pruned from policies (`uuid[]` elements cannot carry a
  foreign key).
- A curated set deleted after being added to a policy leaves a dangling ID. To keep
  this from breaking a user's exercises, `evaluate-exercise-policy` **skips** a set ID
  it cannot resolve and uses the rest, rather than hard-failing the whole generation.
  If every ID is unresolvable the result is empty, which is the same as an empty
  policy (handled by the existing `EmptyVocabError` path).
- The policy aggregate maps to exactly one row, matching its domain aggregate
  boundary.
- Choosing the normalised junction model later would also mean adding a `plpgsql`
  upsert function; it is intentionally avoided here.
