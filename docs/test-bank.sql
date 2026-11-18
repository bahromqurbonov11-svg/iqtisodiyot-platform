begin;

create table if not exists public.econ_test_questions (
  bank text not null,
  source_number integer not null check (source_number > 0),
  question text not null check (length(btrim(question)) > 0),
  options text[] not null check (array_length(options, 1) = 4 and array_position(options, null) is null and array_position(options, '') is null),
  correct_index integer not null check (correct_index between 0 and 3),
  difficulty integer check (difficulty between 1 and 4),
  topic integer check (topic between 1 and 25),
  primary key (bank, source_number)
);

create table if not exists public.econ_test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  answer_keys jsonb not null,
  score integer
);

alter table public.econ_test_questions enable row level security;
alter table public.econ_test_attempts enable row level security;
revoke all on public.econ_test_questions, public.econ_test_attempts from anon, authenticated;

create or replace function public.econ_import_test_bank(items jsonb)
returns integer language plpgsql security definer set search_path = ''
as $$
declare imported integer;
begin
  if not exists (select from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'Admin access required';
  end if;
  if jsonb_typeof(items) is distinct from 'array' or jsonb_array_length(items) not between 1 and 2000 then
    raise exception 'Invalid question batch';
  end if;
  insert into public.econ_test_questions (bank, source_number, question, options, correct_index, difficulty, topic)
  select 'iqtisodiyot-2026', i.source_number, i.question, i.options, i.correct_index, i.difficulty, i.suggested_topic
  from jsonb_to_recordset(items) as i(source_number integer, question text, options text[],
    correct_index integer, difficulty integer, suggested_topic integer, status text)
  where i.status = 'ready'
  on conflict (bank, source_number) do update set question = excluded.question, options = excluded.options,
    correct_index = excluded.correct_index, difficulty = excluded.difficulty, topic = excluded.topic;
  get diagnostics imported = row_count;
  return imported;
end;
$$;

create or replace function public.econ_start_test(wanted_topic integer default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare attempt_id uuid; questions jsonb; keys jsonb;
begin
  if auth.uid() is null then raise exception 'Sign-in required'; end if;
  with sampled as materialized (
    select bank, source_number, question, options, correct_index
    from public.econ_test_questions q
    where wanted_topic is null or q.topic = wanted_topic
    order by random() limit 20
  ), shuffled as materialized (
    select s.question, jsonb_agg(v.option order by v.position) as options,
      max(v.position - 1) filter (where v.original - 1 = s.correct_index) as answer
    from sampled s
    cross join lateral (
      select o.option, o.original, row_number() over (order by random()) as position
      from unnest(s.options) with ordinality o(option, original)
    ) v
    group by s.bank, s.source_number, s.question, s.correct_index
  ), numbered as materialized (
    select *, row_number() over (order by random()) as ord from shuffled
  )
  select jsonb_agg(jsonb_build_object('question', question, 'options', options) order by ord),
    jsonb_agg(answer order by ord) into questions, keys from numbered;
  if keys is null then return jsonb_build_object('questions', '[]'::jsonb); end if;
  insert into public.econ_test_attempts (user_id, answer_keys) values (auth.uid(), keys) returning id into attempt_id;
  return jsonb_build_object('id', attempt_id, 'questions', questions);
end;
$$;

create or replace function public.econ_submit_test(attempt_id uuid, answers integer[])
returns integer language plpgsql security definer set search_path = ''
as $$
declare attempt public.econ_test_attempts; result integer;
begin
  select * into attempt from public.econ_test_attempts a
    where a.id = attempt_id and a.user_id = auth.uid() for update;
  if not found then raise exception 'Attempt not found'; end if;
  if attempt.score is not null then return attempt.score; end if;
  if cardinality(answers) is distinct from jsonb_array_length(attempt.answer_keys)
    or exists (select from unnest(answers) a where a is null or a not between 0 and 3)
    then raise exception 'Invalid answers'; end if;
  select count(*) into result
    from unnest(answers) with ordinality a(choice, position)
    where a.choice = (attempt.answer_keys ->> (a.position::integer - 1))::integer;
  update public.econ_test_attempts a set score = result where a.id = attempt_id;
  return result;
end;
$$;

revoke all on function public.econ_import_test_bank(jsonb), public.econ_start_test(integer), public.econ_submit_test(uuid, integer[]) from public, anon;
grant execute on function public.econ_import_test_bank(jsonb), public.econ_start_test(integer), public.econ_submit_test(uuid, integer[]) to authenticated;
commit;
