-- Redesign the exercise policy: collapse the selectedSets|specificSets union into
-- flat per-skill curated-set lists, keyed by (user_id, language). Set IDs are stored
-- as uuid[] columns (no FK on array elements — see
-- docs/adr/exercise-policy-set-storage.md). Drop the old three-table design.

drop table user_vocab_policy_specific_sets;
drop table user_grammar_policy_specific_sets;
drop table user_exercise_policy;

drop type vocab_source_type;
drop type grammar_source_type;

create table user_exercise_policy (
  user_id         uuid not null references auth.users (id) on delete cascade,
  language        text not null,
  vocab_set_ids   uuid[] not null default '{}',
  grammar_set_ids uuid[] not null default '{}',
  imported_vocab  boolean not null default false,
  primary key (user_id, language)
);

alter table user_exercise_policy enable row level security;

create policy "Users can manage their own exercise policy"
  on user_exercise_policy
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
