begin;
alter table public.econ_runner_runs add column if not exists finished_at timestamptz;

update public.econ_runner_runs
set finished_at=opened
where finished_at is null and not active
  and jsonb_typeof(quiz_results)='array' and quiz_results->-1->>'correct'='false';

do $migration$
declare
  runner text := pg_get_functiondef('public.econ_runner(text,uuid,integer)'::regprocedure);
  report text := pg_get_functiondef('public.econ_admin_activity()'::regprocedure);
begin
  if position('x.finished_at is not null' in runner)=0 then
    if position('where x.passed>0' in runner)=0
      or position('set active=false where id=r.id;' in runner)=0
      or position('set active=false,pending_key=null where id=r.id;' in runner)=0
    then raise exception 'Unexpected runner definition'; end if;
    runner := replace(runner,'where x.passed>0','where x.passed>0 and x.finished_at is not null');
    runner := replace(runner,'set active=false where id=r.id;',
      'set active=false,finished_at=clock_timestamp() where id=r.id;');
    runner := replace(runner,'set active=false,pending_key=null where id=r.id;',
      'set active=false,pending_key=null,finished_at=clock_timestamp() where id=r.id;');
    execute runner;
  end if;
  if position('where r.finished_at is not null' in report)=0 then
    if position('r.opened played_at from public.econ_runner_runs r where not r.active or r.passed>0' in report)=0
    then raise exception 'Unexpected activity definition'; end if;
    report := replace(report,'r.opened played_at from public.econ_runner_runs r where not r.active or r.passed>0',
      'r.finished_at played_at from public.econ_runner_runs r where r.finished_at is not null');
    execute report;
  end if;
end $migration$;
commit;
