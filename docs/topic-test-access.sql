begin;
do $$
begin
  if to_regprocedure('public.econ_start_selected_test_unrestricted(integer,integer)') is null then
    alter function public.econ_start_selected_test(integer,integer) rename to econ_start_selected_test_unrestricted;
  end if;
  if to_regprocedure('public.econ_start_test(integer)') is not null then
    revoke execute on function public.econ_start_test(integer) from public, anon, authenticated;
  end if;
end;
$$;

revoke all on function public.econ_start_selected_test_unrestricted(integer,integer) from public, anon, authenticated;

create or replace function public.econ_start_selected_test(wanted_topic integer, question_limit integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or (
    wanted_topic > 0 and not coalesce(public.is_admin(), false)
    and wanted_topic > public.econ_public_topic_limit()
  ) then
    raise exception 'Topic test is unavailable' using errcode = '42501';
  end if;
  return public.econ_start_selected_test_unrestricted(wanted_topic, question_limit);
end;
$$;
revoke all on function public.econ_start_selected_test(integer,integer) from public, anon;
grant execute on function public.econ_start_selected_test(integer,integer) to authenticated;
commit;
