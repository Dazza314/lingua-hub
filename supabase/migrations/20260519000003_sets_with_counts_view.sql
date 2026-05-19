create view sets_with_counts with (security_invoker = true) as
select
  s.id,
  s.language,
  s.title,
  s.category,
  count(svi.vocab_item_id)::int as vocab_count,
  count(sgp.grammar_point_id)::int as grammar_count
from sets s
left join set_vocab_items svi on svi.set_id = s.id
left join set_grammar_points sgp on sgp.set_id = s.id
group by s.id;

grant select on sets_with_counts to anon, authenticated;
