begin;
alter table public.learning_resources add column if not exists deletion_pending boolean not null default false;
create policy econ_hide_pending_resources on public.learning_resources as restrictive for select to anon, authenticated
  using (not deletion_pending or coalesce(public.is_admin(), false));

alter table public.econ_test_attempts add column if not exists question_deadline timestamptz;
alter table public.econ_test_attempts add column if not exists timed_answers integer[];

create or replace function public.econ_test_counts()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('all', count(*), '-1', count(*) filter(where topic between 1 and 12),
    '-2', count(*) filter(where topic between 13 and 25))
  from public.econ_test_questions
  where auth.uid() is not null and (coalesce(public.is_admin(), false)
    or topic <= public.econ_topic_mastery_limit()
    or (topic is null and public.econ_topic_mastery_limit() = 25));
$$;

create or replace function public.econ_start_selected_test(wanted_topic integer, question_limit integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  maximum integer := case when coalesce(public.is_admin(), false) then 25 else public.econ_topic_mastery_limit() end;
  attempt_id uuid;
  questions jsonb;
  keys jsonb;
  refs jsonb;
  deadline timestamptz;
begin
  if uid is null or wanted_topic > maximum then
    raise exception 'Topic test is unavailable' using errcode = '42501';
  end if;
  with sampled as materialized (
    select q.bank, q.source_number, q.topic, q.question, q.options, q.correct_index
    from public.econ_test_questions q
    where (q.topic <= maximum or (q.topic is null and maximum = 25))
      and (wanted_topic is null or q.topic = wanted_topic or
        (wanted_topic = -1 and q.topic between 1 and 12) or (wanted_topic = -2 and q.topic between 13 and 25))
    order by random()
    limit case when question_limit is null then null else greatest(1, question_limit) end
  ), shuffled as (
    select s.*, v.choices, v.answer
    from sampled s cross join lateral (
      select jsonb_agg(shuffled_option.option order by shuffled_option.position) as choices,
        max(shuffled_option.position - 1) filter(where shuffled_option.original - 1 = s.correct_index) as answer
      from (select o.option, o.original, row_number() over (order by random()) as position
        from unnest(s.options) with ordinality as o(option, original)) shuffled_option
    ) v
  ), numbered as (
    select *, row_number() over(order by random()) as ord from shuffled
  )
  select jsonb_agg(jsonb_build_object('question', question, 'options', choices) order by ord),
    jsonb_agg(answer order by ord),
    jsonb_agg(jsonb_build_object('bank', bank, 'number', source_number, 'topic', topic, 'question', question) order by ord)
  into questions, keys, refs from numbered;
  if keys is null then return jsonb_build_object('questions', '[]'::jsonb); end if;
  deadline := clock_timestamp() + interval '90 seconds';
  insert into public.econ_test_attempts
    (user_id, answer_keys, test_scope, question_refs, question_deadline, timed_answers)
  values (uid, keys, wanted_topic, refs, deadline, array[]::integer[]) returning id into attempt_id;
  return jsonb_build_object('id', attempt_id, 'questions', questions, 'deadline', deadline);
end;
$$;

create or replace function public.econ_record_timed_answer(attempt_id uuid, question_index integer, choice integer)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare attempt public.econ_test_attempts; answered integer;
begin
  select * into attempt from public.econ_test_attempts a
    where a.id = attempt_id and a.user_id = auth.uid() for update;
  if not found or attempt.timed_answers is null or choice is null or choice not between 0 and 4 then
    raise exception 'Invalid attempt or answer';
  end if;
  answered := cardinality(attempt.timed_answers);
  if question_index = answered and answered < jsonb_array_length(attempt.answer_keys) and attempt.score is null then
    if clock_timestamp() >= attempt.question_deadline then choice := 4; end if;
    update public.econ_test_attempts a set timed_answers = array_append(a.timed_answers, choice),
      question_deadline = clock_timestamp() + interval '90 seconds'
      where a.id = attempt_id returning * into attempt;
  elsif question_index is null or question_index < 0 or question_index >= answered then
    raise exception 'Question is out of order';
  end if;
  return jsonb_build_object('answers', attempt.timed_answers, 'deadline', attempt.question_deadline);
end;
$$;
revoke all on function public.econ_record_timed_answer(uuid,integer,integer) from public, anon;
grant execute on function public.econ_record_timed_answer(uuid,integer,integer) to authenticated;

create or replace function public.econ_submit_test(attempt_id uuid, answers integer[])
returns integer language plpgsql security definer set search_path = ''
as $$
declare attempt public.econ_test_attempts; result integer;
begin
  select * into attempt from public.econ_test_attempts a
    where a.id = attempt_id and a.user_id = auth.uid() for update;
  if not found then raise exception 'Attempt not found'; end if;
  if attempt.score is not null then return attempt.score; end if;
  if attempt.timed_answers is not null then answers := attempt.timed_answers; end if;
  if cardinality(answers) is distinct from jsonb_array_length(attempt.answer_keys)
    or exists(select from unnest(answers) a where a is null or a not between 0 and 4)
  then raise exception 'Invalid answers'; end if;
  select count(*) into result from unnest(answers) with ordinality a(choice, position)
    where a.choice = (attempt.answer_keys ->> (a.position::integer - 1))::integer;
  update public.econ_test_attempts a set score = result, selected_answers = answers where a.id = attempt_id;
  return result;
end;
$$;
commit;
