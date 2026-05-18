create type vocab_source_type as enum ('selectedSets', 'specificSets');
create type grammar_source_type as enum ('selectedSets', 'specificSets');

create table user_exercise_policy (
  user_id        uuid primary key references auth.users on delete cascade,
  vocab_source   vocab_source_type not null,
  grammar_source grammar_source_type not null,
  imported_vocab boolean not null
);

create table user_vocab_policy_specific_sets (
  user_id uuid not null references auth.users on delete cascade,
  set_id  uuid not null references sets on delete cascade,
  primary key (user_id, set_id)
);

create table user_grammar_policy_specific_sets (
  user_id uuid not null references auth.users on delete cascade,
  set_id  uuid not null references sets on delete cascade,
  primary key (user_id, set_id)
);

alter table user_exercise_policy enable row level security;
alter table user_vocab_policy_specific_sets enable row level security;
alter table user_grammar_policy_specific_sets enable row level security;

create policy "Users can manage their own exercise policy"
  on user_exercise_policy
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own vocab policy sets"
  on user_vocab_policy_specific_sets
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage their own grammar policy sets"
  on user_grammar_policy_specific_sets
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
