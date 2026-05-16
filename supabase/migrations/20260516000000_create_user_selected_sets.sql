create table user_selected_sets (
  user_id uuid not null references auth.users (id) on delete cascade,
  set_id  uuid not null references sets (id) on delete cascade,
  primary key (user_id, set_id)
);

alter table user_selected_sets enable row level security;

create policy "Users can manage their own set selections"
  on user_selected_sets
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
