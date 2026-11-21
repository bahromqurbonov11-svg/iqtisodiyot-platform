begin;
create table if not exists public.econ_topic_access (
  singleton boolean primary key check (singleton),
  maximum integer not null check (maximum between 0 and 25)
);
alter table public.econ_topic_access enable row level security;
revoke all on public.econ_topic_access from public, anon, authenticated;
insert into public.econ_topic_access values (true, 25) on conflict do nothing;

create or replace function public.econ_public_topic_limit()
returns integer language sql stable security definer set search_path = ''
as $$ select maximum from public.econ_topic_access where singleton; $$;

create or replace function public.econ_set_public_topic_limit(new_maximum integer)
returns integer language plpgsql security definer set search_path = ''
as $$
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Administrator permission required' using errcode = '42501';
  end if;
  update public.econ_topic_access set maximum = new_maximum where singleton;
  return new_maximum;
end;
$$;
revoke all on function public.econ_public_topic_limit() from public;
revoke all on function public.econ_set_public_topic_limit(integer) from public, anon;
grant execute on function public.econ_public_topic_limit() to anon, authenticated;
grant execute on function public.econ_set_public_topic_limit(integer) to authenticated;

create or replace function public.econ_topic_folder_open(folder text)
returns boolean language sql stable set search_path = ''
as $$
  select case
    when folder ~ '^in[12]-t[0-9]{2}$'
      then coalesce(public.is_admin(), false) or
        (substring(folder from 6)::integer + case when folder like 'in2-%' then 12 else 0 end)
          <= public.econ_public_topic_limit()
    else true
  end;
$$;

drop policy if exists econ_topic_storage_limit on storage.objects;
create policy econ_topic_storage_limit on storage.objects as restrictive for select to anon, authenticated
  using (bucket_id <> 'learning-resources' or public.econ_topic_folder_open(split_part(name, '/', 1)));
drop policy if exists econ_topic_resources_limit on public.learning_resources;
create policy econ_topic_resources_limit on public.learning_resources as restrictive for select to anon, authenticated
  using (public.econ_topic_folder_open(split_part(file_path, '/', 1))
    and public.econ_topic_folder_open(topic_name));
commit;
