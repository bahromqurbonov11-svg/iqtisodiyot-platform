begin;
alter table public.econ_test_attempts add column if not exists test_scope integer;
alter table public.econ_test_attempts add column if not exists submitted_at timestamptz;
do $migration$
declare body text := pg_get_functiondef('public.econ_start_test(integer)'::regprocedure);
begin
 body := regexp_replace(body,'econ_start_test\([^)]*\)','econ_start_selected_test(wanted_topic integer, question_limit integer)','i');
 body := replace(body,'wanted_topic is null or q.topic=wanted_topic','wanted_topic is null or q.topic=wanted_topic or (wanted_topic=-1 and q.topic between 1 and 12) or (wanted_topic=-2 and q.topic between 13 and 25)');
 body := replace(body,'limit 20','limit case when question_limit is null then null else greatest(1,question_limit) end');
 body := replace(body,'(user_id,answer_keys) values(auth.uid(),keys)','(user_id,answer_keys,test_scope) values(auth.uid(),keys,wanted_topic)');
 if position('question_limit is null' in body)=0 or position('wanted_topic=-2' in body)=0 or position('keys,wanted_topic' in body)=0 then raise exception 'Unexpected start function'; end if;
 execute body;
end $migration$;
revoke all on function public.econ_start_selected_test(integer,integer) from public,anon;
grant execute on function public.econ_start_selected_test(integer,integer) to authenticated;

create or replace function public.econ_test_counts()
returns jsonb language sql stable security definer set search_path=''
as $$ select jsonb_build_object('all',count(*),'-1',count(*) filter(where topic between 1 and 12),'-2',count(*) filter(where topic between 13 and 25)) from public.econ_test_questions where auth.uid() is not null $$;
revoke all on function public.econ_test_counts() from public,anon;
grant execute on function public.econ_test_counts() to authenticated;

create or replace function public.econ_test_results()
returns table(attempt_id uuid, student text, taken_at timestamptz, points integer, total integer, test_scope integer)
language sql stable security definer set search_path=''
as $$
select a.id, coalesce(nullif(concat_ws(' ',p.first_name,p.last_name),''),a.user_id::text), coalesce(a.submitted_at,a.created_at), a.score, jsonb_array_length(a.answer_keys), a.test_scope
from public.econ_test_attempts a left join public.profiles p on p.id=a.user_id
where a.score is not null and (a.user_id=auth.uid() or exists(select from public.profiles x where x.id=auth.uid() and x.role='admin'))
order by coalesce(a.submitted_at,a.created_at) desc
$$;
revoke all on function public.econ_test_results() from public,anon;
grant execute on function public.econ_test_results() to authenticated;
create or replace function public.econ_record_submission() returns trigger language plpgsql set search_path='' as $$
begin new.submitted_at := clock_timestamp(); return new; end $$;
create or replace trigger econ_record_submission before update of score on public.econ_test_attempts for each row when (old.score is null and new.score is not null) execute function public.econ_record_submission();
commit;
