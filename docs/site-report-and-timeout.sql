begin;

create table if not exists public.econ_site_visits (
  id uuid primary key,
  last_report timestamptz not null default clock_timestamp(),
  seconds bigint not null default 0
);
alter table public.econ_site_visits enable row level security;
revoke all on public.econ_site_visits from public, anon, authenticated;

create or replace function public.econ_visit_report(visit uuid, elapsed integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare now_at timestamptz := clock_timestamp();
begin
  if visit is null or elapsed is null or elapsed < 0 or elapsed > 30 then
    raise exception 'Invalid visit report';
  end if;
  insert into public.econ_site_visits as v (id, last_report)
  values (visit, now_at)
  on conflict (id) do update
    set seconds = v.seconds + least(elapsed, greatest(0, floor(extract(epoch from now_at - v.last_report)))::integer),
        last_report = greatest(v.last_report, now_at);
  return (select jsonb_build_object('visits', count(*), 'seconds', coalesce(sum(seconds), 0))
    from public.econ_site_visits);
end;
$$;
revoke all on function public.econ_visit_report(uuid, integer) from public;
grant execute on function public.econ_visit_report(uuid, integer) to anon, authenticated;

-- Index 4 represents an unanswered question. Stored keys range from 0 to 3.
do $$
declare definition text := pg_get_functiondef('public.econ_submit_test(uuid,integer[])'::regprocedure);
begin
  if position('not between 0 and 3' in definition) > 0 then
    execute replace(definition, 'not between 0 and 3', 'not between 0 and 4');
  elsif position('not between 0 and 4' in definition) = 0 then
    raise exception 'Test validation could not be updated';
  end if;
end;
$$;

commit;
