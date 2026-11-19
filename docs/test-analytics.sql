begin;
alter table public.econ_test_attempts add column if not exists question_refs jsonb;
alter table public.econ_test_attempts add column if not exists selected_answers integer[];
do $$
declare
  start_definition text := pg_get_functiondef('public.econ_start_selected_test(integer,integer)'::regprocedure);
  submit_definition text := pg_get_functiondef('public.econ_submit_test(uuid,integer[])'::regprocedure);
begin
  if position('wanted_topic,refs' in start_definition) = 0 then
    start_definition := replace(start_definition,'questions jsonb; keys jsonb;','questions jsonb; keys jsonb; refs jsonb;');
    start_definition := replace(start_definition,'q.question,q.options,q.correct_index','q.question,q.options,q.correct_index,q.topic');
    start_definition := replace(start_definition,'select s.question,jsonb_agg','select s.bank,s.source_number,s.topic,s.question,jsonb_agg');
    start_definition := replace(start_definition,'s.question,s.correct_index)','s.question,s.correct_index,s.topic)');
    start_definition := replace(start_definition,'into questions,keys from numbered',',jsonb_agg(jsonb_build_object(''bank'',bank,''number'',source_number,''topic'',topic,''question'',question) order by ord) into questions,keys,refs from numbered');
    start_definition := replace(start_definition,'answer_keys,test_scope) values(auth.uid(),keys,wanted_topic)','answer_keys,test_scope,question_refs) values(auth.uid(),keys,wanted_topic,refs)');
    if position('wanted_topic,refs' in start_definition) = 0 then raise exception 'Unexpected start function'; end if;
    execute start_definition;
  end if;
  if position('selected_answers=answers' in submit_definition) = 0 then
    submit_definition := replace(submit_definition,'set score=result','set score=result,selected_answers=answers');
    if position('selected_answers=answers' in submit_definition) = 0 then raise exception 'Unexpected submit function'; end if;
    execute submit_definition;
  end if;
end $$;

create or replace function public.econ_analytics()
returns jsonb language sql stable security definer set search_path=''
as $$
select coalesce(jsonb_agg(jsonb_build_object('attempt_id',a.id,'student_id',a.user_id,
  'student',concat_ws(' ',p.first_name,p.last_name),'group_id',p.group_id,'group_name',g.name,
  'taken_at',coalesce(a.submitted_at,a.created_at),'points',a.score,
  'total',jsonb_array_length(a.answer_keys),'test_scope',a.test_scope,'items',d.items)
  order by coalesce(a.submitted_at,a.created_at) desc),'[]'::jsonb)
from public.econ_test_attempts a
left join public.profiles p on p.id=a.user_id
left join public.student_groups g on g.id=p.group_id
left join lateral (
  select jsonb_agg(r.item || jsonb_build_object('correct',
    a.selected_answers[r.n::integer]=(a.answer_keys->>(r.n::integer-1))::integer) order by r.n) as items
  from jsonb_array_elements(a.question_refs) with ordinality r(item,n)
) d on true
where a.score is not null
  and (a.user_id=auth.uid() or exists(select from public.profiles x where x.id=auth.uid() and x.role='admin'))
$$;
revoke all on function public.econ_analytics() from public,anon;
grant execute on function public.econ_analytics() to authenticated;
commit;
