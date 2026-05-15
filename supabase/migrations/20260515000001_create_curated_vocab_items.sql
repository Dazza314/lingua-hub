create table curated_vocab_items (
  id       uuid primary key,
  language text not null,
  term     text not null
);

-- RLS
alter table curated_vocab_items enable row level security;

create policy "Public read access"
  on curated_vocab_items for select
  using (true);

-- Unique constraint: one entry per term per language
alter table curated_vocab_items add constraint curated_vocab_items_language_term_key unique (language, term);

-- Index for getCuratedVocabItems(language) query
create index curated_vocab_items_language_idx on curated_vocab_items (language);
