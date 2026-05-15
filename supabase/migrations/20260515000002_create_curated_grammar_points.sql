create table curated_grammar_points (
  id          uuid primary key,
  language    text not null,
  title       text not null,
  explanation text not null
);

-- RLS
alter table curated_grammar_points enable row level security;

create policy "Public read access"
  on curated_grammar_points for select
  using (true);

-- Unique constraint: one entry per title per language
alter table curated_grammar_points add constraint curated_grammar_points_language_title_key unique (language, title);

-- Index for getCuratedGrammarPoints(language) query
create index curated_grammar_points_language_idx on curated_grammar_points (language);
