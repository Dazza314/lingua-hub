imported_vocab_items — id, user_id, language, term, source, created_at.
curated_vocab_items — id, language, term.
curated_grammar_points — id, language, name, description, examples.
sets — id, name, language, type, created_by (nullable).
set_vocab_items — set_id, vocab_item_id.
set_grammar_points — set_id, grammar_point_id.
user_sets — user_id, set_id. Tracks which sets a user is currently working on in the curated flow.
Deferred — performance tracking tables, user-created sets feature.

Add fields (reading, meaning, source metadata, etc.) when they earn their place. Resist filling out the schema speculatively.
One thing worth flagging: when you build out the seed data, you'll likely want to include reading/meaning somewhere — probably in the source files (CSV, JSON, whatever) you import from — even if they don't make it into the database yet. That way when you later decide you need them, the data is already at hand. Just a heads-up, not a schema decision.
