begin;

-- Talabaning saytdagi FAOL vaqti (harakatsiz paytlar mijoz tomonida hisoblanmaydi).
create table if not exists public.econ_learner_time (
  user_id uuid primary key references auth.users(id) on delete cascade,
  seconds bigint not null default 0,
  last_report timestamptz not null default clock_timestamp()
);
alter table public.econ_learner_time enable row level security;
revoke all on public.econ_learner_time from public, anon, authenticated;

-- Har 15 soniyada mijoz o‘tgan faol soniyalarni yuboradi (0..30). Server uni ikki marta cheklaydi:
-- yuborilgan qiymat va oxirgi hisobotdan beri o‘tgan real vaqt bilan.
create or replace function public.econ_time_report(elapsed integer)
returns void language plpgsql security definer set search_path = ''
as $$
declare uid uuid := auth.uid(); now_at timestamptz := clock_timestamp();
begin
  if uid is null then return; end if;
  if elapsed is null or elapsed < 0 or elapsed > 30 then raise exception 'Invalid time report'; end if;
  if exists (select from public.profiles p where p.id = uid and (p.role = 'admin' or p.group_id = 900000)) then return; end if;
  insert into public.econ_learner_time as t (user_id, last_report) values (uid, now_at)
  on conflict (user_id) do update
    set seconds = t.seconds + least(elapsed, greatest(0, floor(extract(epoch from now_at - t.last_report)))::integer),
        last_report = now_at;
end;
$$;
revoke all on function public.econ_time_report(integer) from public, anon;
grant execute on function public.econ_time_report(integer) to authenticated;

-- Sodiqlik reytingi: eng ko‘p faol vaqt. Nishon egasi faqat bitta; kamida 10 soat (36000 s) kerak.
create or replace function public.econ_loyalty()
returns jsonb language sql stable security definer set search_path = ''
as $$
with ranked as (
  select t.user_id, t.seconds,
    coalesce(nullif(concat_ws(' ', p.first_name, p.last_name), ''), 'Talaba') as name,
    row_number() over (order by t.seconds desc, t.last_report asc) as rn
  from public.econ_learner_time t
  join public.profiles p on p.id = t.user_id
  where p.role <> 'admin' and coalesce(p.group_id, 0) <> 900000
), admin_ok as (
  select exists (select from public.profiles x where x.id = auth.uid() and x.role = 'admin') as is_admin
)
select jsonb_build_object(
  'min_seconds', 36000,
  'total', (select count(*) from ranked),
  'me', (select jsonb_build_object('seconds', r.seconds, 'rank', r.rn) from ranked r where r.user_id = auth.uid()),
  'top', (select coalesce(jsonb_agg(jsonb_build_object('name', r.name, 'seconds', r.seconds, 'me', r.user_id = auth.uid()) order by r.rn), '[]'::jsonb)
          from ranked r where r.rn <= 2),
  'ranking', (select case when a.is_admin then (select coalesce(jsonb_agg(jsonb_build_object('name', r.name, 'seconds', r.seconds) order by r.rn), '[]'::jsonb)
          from ranked r where r.rn <= 15) end from admin_ok a)
)
$$;
revoke all on function public.econ_loyalty() from public, anon;
grant execute on function public.econ_loyalty() to authenticated;

commit;
