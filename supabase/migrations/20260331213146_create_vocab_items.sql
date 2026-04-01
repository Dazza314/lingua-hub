create table vocab_items (
  id         uuid primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  term       text not null,
  definition text not null,
  reading    text,
  created_at timestamptz not null default now()
);

-- RLS
alter table vocab_items enable row level security;

create policy "Users can manage their own vocab items"
  on vocab_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for getItems(userId) query
create index vocab_items_user_id_idx on vocab_items (user_id);
