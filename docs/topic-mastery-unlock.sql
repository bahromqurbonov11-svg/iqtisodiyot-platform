begin;

create or replace function public.econ_topic_mastery_limit()
returns integer language sql stable security definer set search_path = ''
as $$
  with settings as (
    select public.econ_public_topic_limit() as baseline,
      exists(select 1 from public.profiles p
        where p.id = auth.uid() and p.role <> 'admin' and p.group_id is distinct from 900000) as eligible
  )
  select case when baseline in (0, 25) or not eligible then baseline
    else greatest(baseline, coalesce((
      select min(topic)
      from pg_catalog.generate_series(1, 24) as series(topic)
      where not exists (
        select 1 from public.econ_test_attempts a
        where a.user_id = auth.uid() and a.test_scope = topic and a.score is not null
          and jsonb_array_length(a.answer_keys) > 0
          and a.score::bigint * 100 > jsonb_array_length(a.answer_keys)::bigint * 80
      )
    ), 25)) end
  from settings;
$$;
revoke all on function public.econ_topic_mastery_limit() from public;
grant execute on function public.econ_topic_mastery_limit() to anon, authenticated;

create or replace function public.econ_topic_folder_open(folder text)
returns boolean language sql stable set search_path = ''
as $$
  select case when folder ~ '^in[12]-t[0-9]{2}$' then
    coalesce(public.is_admin(), false) or
      (substring(folder from 6)::integer + case when folder like 'in2-%' then 12 else 0 end)
        <= public.econ_topic_mastery_limit()
  else true end;
$$;

create or replace function public.econ_start_selected_test(wanted_topic integer, question_limit integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or (
    wanted_topic > 0 and not coalesce(public.is_admin(), false)
    and wanted_topic > public.econ_topic_mastery_limit()
  ) then
    raise exception 'Topic test is unavailable' using errcode = '42501';
  end if;
  return public.econ_start_selected_test_unrestricted(wanted_topic, question_limit);
end;
$$;

commit;
