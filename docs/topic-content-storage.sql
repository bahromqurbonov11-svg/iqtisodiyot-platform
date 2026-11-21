insert into storage.buckets (id, name, public) values ('topic-content', 'topic-content', false)
on conflict (id) do nothing;

create policy econ_read_open_topic_content on storage.objects for select to anon, authenticated
using (
  bucket_id = 'topic-content' and case when name ~ '^[0-9]{1,2}\.zip$' then
    coalesce(public.is_admin(), false) or split_part(name, '.', 1)::integer between 1 and public.econ_topic_mastery_limit()
  else false end
);
