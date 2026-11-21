begin;

create table if not exists public.econ_research_link_settings (
  singleton boolean primary key default true check (singleton),
  url text not null
);

alter table public.econ_research_link_settings enable row level security;
revoke all on public.econ_research_link_settings from public, anon, authenticated;

create or replace function public.econ_get_research_link()
returns text language sql stable security definer set search_path = ''
as $$
  select url from public.econ_research_link_settings where singleton;
$$;

create or replace function public.econ_set_research_link(link text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Administrator permission required' using errcode = '42501';
  end if;
  if link is null or length(link) > 2048 or strpos(link, chr(92)) > 0
    or link !~* '^https?://[^/?#[:space:][:cntrl:]@]+([/?#][^[:space:][:cntrl:]]*)?$' then
    raise exception 'Invalid research URL' using errcode = '22023';
  end if;
  insert into public.econ_research_link_settings (singleton, url)
  values (true, link)
  on conflict (singleton) do update set url = excluded.url;
end;
$$;

revoke all on function public.econ_get_research_link() from public, anon, authenticated;
revoke all on function public.econ_set_research_link(text) from public, anon, authenticated;
grant execute on function public.econ_get_research_link() to anon, authenticated;
grant execute on function public.econ_set_research_link(text) to authenticated;

commit;
