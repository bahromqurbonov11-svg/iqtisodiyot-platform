begin;
alter table public.econ_live_rooms add column if not exists round_kind text;
alter table public.econ_live_rooms add column if not exists round_visual jsonb;
alter table public.econ_live_players add column if not exists correct_count integer not null default 0;
alter table public.econ_live_players add column if not exists response_count integer not null default 0;

create or replace function public.econ_live_mixed(operation text, room_code text, payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r public.econ_live_rooms;
  base jsonb;
  task record;
  kind text;
  remaining numeric;
  choice jsonb := payload->'answer';
begin
  if uid is null then raise exception 'Sign-in required'; end if;
  if operation = 'create' then
    base := public.econ_live_game('create', '', jsonb_build_object('mode','graph','topic',payload->'topic'));
    room_code := base->>'code';
  elsif operation in ('start','answer') then
    select * into r from public.econ_live_rooms where code=upper(btrim(room_code)) for update;
    if r.code is null or r.finished or r.expires_at<=clock_timestamp() then raise exception 'Room unavailable'; end if;
    if operation='start' then
      if uid<>r.host or not coalesce(public.is_admin(),false) or r.deadline>clock_timestamp()
      then raise exception 'Round cannot start'; end if;
      kind := (array['quiz','match','graph'])[1+mod(r.round,3)];
      if kind='quiz' then
        select t.question, s.options, s.answer, t.bank||':'||t.source_number as ref into task
        from (select * from public.econ_test_questions
          where topic between 1 and r.topic and not (bank||':'||source_number=any(r.used))
          order by (topic=r.topic) desc, random() limit 1) t
        cross join lateral (
          select jsonb_agg(o.option order by o.position) as options,
            to_jsonb(max(o.position-1) filter(where o.original-1=t.correct_index)) as answer
          from (select source.option, source.original, row_number() over(order by random()) position
            from unnest(t.options) with ordinality source(option,original)) o
        ) s;
      else
        if coalesce((payload->>'topic')::integer,0) not between 1 and r.topic
          or length(coalesce(payload->>'prompt','')) not between 1 and 1500 or choice is null or choice='null'::jsonb
        then raise exception 'Invalid task'; end if;
        select payload->>'prompt' as question, payload->'options' as options, choice as answer,
          kind||':'||(payload->>'id') as ref into task;
      end if;
      if task.question is null then raise exception 'Question bank exhausted'; end if;
      update public.econ_live_rooms set round=r.round+1, round_kind=kind, prompt=task.question, options=task.options,
        answer=task.answer, deadline=clock_timestamp()+interval '45 seconds', used=array_append(r.used,task.ref),
        round_visual=case when kind='quiz' then null else payload->'visual' end where code=r.code;
    else
      if r.deadline is null or (payload->>'round')::integer is distinct from r.round
        or choice is null or choice='null'::jsonb then raise exception 'Round closed'; end if;
      remaining := extract(epoch from r.deadline-clock_timestamp());
      if remaining<=0 then raise exception 'Round closed'; end if;
      update public.econ_live_players set answered_round=r.round, last_answer=choice, response_count=response_count+1,
        correct_count=correct_count+case when choice=r.answer then 1 else 0 end,
        score=score+case when choice=r.answer then 100+floor(100*least(remaining,45)/45)::integer else 0 end
        where code=r.code and player=uid and answered_round<r.round;
    end if;
    base := public.econ_live_game('state',room_code);
  else
    base := public.econ_live_game(operation,room_code);
  end if;
  select * into r from public.econ_live_rooms where code=base->>'code';
  return base || jsonb_build_object('topic',r.topic,'roundKind',r.round_kind,'visual',r.round_visual,
    'top',coalesce((select jsonb_agg(jsonb_build_object('name',s.name,'score',s.score) order by s.score desc,s.name,s.player)
      from (select name,score,player from public.econ_live_players where code=r.code order by score desc,name,player limit 3) s),'[]'),
    'ranking',case when r.finished then (select coalesce(jsonb_agg(jsonb_build_object('name',name,'score',score,'correct',correct_count,'responses',response_count) order by score desc,name,player),'[]') from public.econ_live_players where code=r.code) end,
    'distribution',case when (base->>'closed')::boolean and (r.round_kind='quiz' or jsonb_typeof(r.answer)='number') then
      (select jsonb_agg((select count(*) from public.econ_live_players where code=r.code and answered_round=r.round and last_answer=to_jsonb(i)) order by i)
       from generate_series(0,jsonb_array_length(r.options)-1) i) end);
end;
$$;
revoke all on function public.econ_live_mixed(text,text,jsonb) from public,anon;
grant execute on function public.econ_live_mixed(text,text,jsonb) to authenticated;
revoke execute on function public.econ_live_game(text,text,jsonb) from authenticated;
commit;
