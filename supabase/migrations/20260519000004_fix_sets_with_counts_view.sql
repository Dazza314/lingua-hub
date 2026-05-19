create or replace view sets_with_counts with (security_invoker = true) as
select
  s.id,
  s.language,
  s.title,
  s.category,
  (select count(*) from set_vocab_items svi where svi.set_id = s.id)::int as vocab_count,
  (select count(*) from set_grammar_points sgp where sgp.set_id = s.id)::int as grammar_count
from sets s;
