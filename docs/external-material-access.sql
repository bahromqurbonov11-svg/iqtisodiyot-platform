begin;
insert into public.student_groups (id, name, is_active) overriding system value
values (900000, 'Tashqi foydalanuvchilar', true)
on conflict (id) do nothing;

create policy econ_limit_external_downloads on storage.objects
as restrictive for select to authenticated
using (
  bucket_id <> 'learning-resources'
  or not exists (
    select from public.profiles p
    where p.id = (select auth.uid()) and p.group_id = 900000 and p.role <> 'admin'
  )
);
commit;
