alter table user_vocab_policy_specific_sets
  drop constraint user_vocab_policy_specific_sets_user_id_fkey,
  add constraint user_vocab_policy_specific_sets_user_id_fkey
    foreign key (user_id) references user_exercise_policy (user_id) on delete cascade;

alter table user_grammar_policy_specific_sets
  drop constraint user_grammar_policy_specific_sets_user_id_fkey,
  add constraint user_grammar_policy_specific_sets_user_id_fkey
    foreign key (user_id) references user_exercise_policy (user_id) on delete cascade;
