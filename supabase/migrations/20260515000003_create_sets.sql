create table sets (
  id       uuid primary key,
  language text not null,
  title    text not null
);

alter table sets enable row level security;

create policy "Public read access"
  on sets for select
  using (true);

create index sets_language_idx on sets (language);


create table set_vocab_items (
  set_id        uuid not null references sets (id),
  vocab_item_id uuid not null references curated_vocab_items (id),
  primary key (set_id, vocab_item_id)
);

alter table set_vocab_items enable row level security;

create policy "Public read access"
  on set_vocab_items for select
  using (true);


create table set_grammar_points (
  set_id            uuid not null references sets (id),
  grammar_point_id  uuid not null references curated_grammar_points (id),
  primary key (set_id, grammar_point_id)
);

alter table set_grammar_points enable row level security;

create policy "Public read access"
  on set_grammar_points for select
  using (true);
