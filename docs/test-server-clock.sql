begin;
create or replace function public.econ_test_clock(target_attempt uuid)
returns jsonb language sql volatile security definer set search_path=''
as $$
  select jsonb_build_object('deadline',question_deadline,'serverNow',clock_timestamp(),'answers',timed_answers)
  from public.econ_test_attempts
  where id=target_attempt and user_id=auth.uid() and score is null and timed_answers is not null
$$;
revoke all on function public.econ_test_clock(uuid) from public,anon;
grant execute on function public.econ_test_clock(uuid) to authenticated;

do $migration$
declare
  signature regprocedure;
  definition text;
  updated text;
begin
  foreach signature in array array[
    'public.econ_start_selected_test(integer,integer)'::regprocedure,
    'public.econ_record_timed_answer(uuid,integer,integer)'::regprocedure
  ] loop
    definition := pg_get_functiondef(signature);
    if position('serverNow' in definition)>0 then continue; end if;
    updated := regexp_replace(definition,
      '(''deadline''[[:space:]]*,[[:space:]]*(?:attempt[.]question_deadline|deadline))',
      '\1,''serverNow'',clock_timestamp()');
    if updated=definition then raise exception 'Unexpected test clock function: %',signature; end if;
    execute updated;
  end loop;
end $migration$;
commit;
