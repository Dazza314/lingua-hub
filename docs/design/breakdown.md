Ticket sketch
I've grouped these into rough phases. Within a phase, tickets are roughly independent and could be parallelized; across phases, there are dependencies.

- [x] Phase 1a: DB rename

Migration: rename vocab_items to imported_vocab_items, add source column. Update RLS policies if present.

- [x] Phase 1b: Code rename

Rename domain model VocabItem → ImportedVocabItem. Update port interface and Supabase adapter. Update generated Supabase types. Update all references in the codebase.

- [ ] Phase 2: Curated vocab

Migration: create curated_vocab_items table. Public read, restricted write (RLS).
Create CuratedVocabItem domain model and persistence port.
Create Supabase adapter for CuratedVocabItem port. Read methods only (seed data, no user writes).

- [ ] Phase 3: Curated grammar

Migration: create curated_grammar_points table. Public read, restricted write (RLS).
Create CuratedGrammarPoint domain model and persistence port.
Create Supabase adapter for CuratedGrammarPoint port. Read methods only (seed data, no user writes).

- [ ] Phase 4: Sets and junctions

Migration: create sets, set_vocab_items, set_grammar_points tables. Public read on sets and junctions, restricted write (RLS).
Create Set domain model and persistence port. Decide how junction relationships are exposed on the model (eager list of item IDs, lazy lookup, or separate query).
Create Supabase adapter for Set port. Read methods only (seed data, no user writes). Includes fetching associated vocab items and grammar points.

- [ ] Phase 5: User sets

Migration: create user_sets table. RLS scoped to the owning user.
Create UserSet domain model and persistence port.
Create Supabase adapter for UserSet port. Insert, delete, find by user.
Tests for insert and find on UserSet.
