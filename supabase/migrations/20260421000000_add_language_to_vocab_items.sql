alter table vocab_items add column language text not null;

-- Replace single-column index with a composite one for getVocabItems(userId, language)
drop index vocab_items_user_id_idx;
create index vocab_items_user_id_language_idx on vocab_items (user_id, language);
