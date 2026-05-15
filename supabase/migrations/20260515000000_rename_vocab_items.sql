ALTER TABLE vocab_items RENAME TO imported_vocab_items;

ALTER INDEX vocab_items_user_id_language_idx
  RENAME TO imported_vocab_items_user_id_language_idx;

CREATE TYPE imported_vocab_source AS ENUM ('anki');

ALTER TABLE imported_vocab_items
  ADD COLUMN source imported_vocab_source;
UPDATE imported_vocab_items SET source = 'anki';
ALTER TABLE imported_vocab_items
  ALTER COLUMN source SET NOT NULL;
