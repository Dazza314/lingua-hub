alter table imported_vocab_items alter column id set default gen_random_uuid();
alter table curated_vocab_items alter column id set default gen_random_uuid();
alter table curated_grammar_points alter column id set default gen_random_uuid();
alter table sets alter column id set default gen_random_uuid();
