begin;
create or replace function public.econ_game_topic_limit()
returns integer language sql stable security definer set search_path = ''
as $$
  select max_topic from public.econ_runner_settings where singleton
$$;
revoke all on function public.econ_game_topic_limit() from public;
grant execute on function public.econ_game_topic_limit() to anon, authenticated;
commit;
