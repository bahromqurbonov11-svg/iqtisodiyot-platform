begin;
alter table public.econ_live_rooms add column if not exists round_kind text;
alter table public.econ_live_rooms add column if not exists round_visual jsonb;
alter table public.econ_live_rooms add column if not exists round_plan text[];
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
  round_points integer;
  choice jsonb := payload->'answer';
begin
  if uid is null then raise exception 'Sign-in required'; end if;
  if operation = 'create' then
    base := public.econ_live_game('create', '', jsonb_build_object('mode','graph','topic',payload->'topic'));
    room_code := base->>'code';
    update public.econ_live_rooms
    set round_plan=(select array_agg(item order by random())
      from unnest(array['quiz','quiz','quiz','quiz','quiz','match','match','match','graph','graph']) item)
    where code=room_code;
  elsif operation in ('start','answer') then
    select * into r from public.econ_live_rooms where code=upper(btrim(room_code)) for update;
    if r.code is null or r.finished or r.expires_at<=clock_timestamp() then raise exception 'Room unavailable'; end if;
    if operation='start' then
      if uid<>r.host or not coalesce(public.is_admin(),false) or r.deadline>clock_timestamp()
      then raise exception 'Round cannot start'; end if;
      if r.round_plan is not null and r.round>=10 then raise exception 'All rounds complete'; end if;
      kind := coalesce(r.round_plan[r.round+1], (array['quiz','match','graph'])[1+mod(r.round,3)]);
      if kind='quiz' then
        select t.question, s.options, s.answer, t.bank||':'||t.source_number as ref into task
        from (select * from public.econ_test_questions
          where topic between 1 and r.topic and not (bank||':'||source_number=any(r.used))
            and not ('quiz-text:'||md5(regexp_replace(lower(question),'[^[:alnum:]]','','g'))=any(r.used))
          order by (topic=r.topic) desc, random() limit 1) t
        cross join lateral (
          select jsonb_agg(o.option order by o.position) as options,
            to_jsonb(max(o.position-1) filter(where o.original-1=t.correct_index)) as answer
          from (select source.option, source.original, row_number() over(order by random()) position
            from unnest(t.options) with ordinality source(option,original)) o
        ) s;
      else
        if (kind='match' and coalesce((payload->>'topic')::integer,0) not between 1 and r.topic)
          or (kind='graph' and coalesce((payload->>'topic')::integer,0)<>6)
          or length(coalesce(payload->>'prompt','')) not between 1 and 1500 or choice is null or choice='null'::jsonb
        then raise exception 'Invalid task'; end if;
        select payload->>'prompt' as question, payload->'options' as options, choice as answer,
          kind||':'||(payload->>'id') as ref into task;
      end if;
      if task.question is null then raise exception 'Question bank exhausted'; end if;
      if task.ref is null or task.ref=any(r.used) then raise exception 'Task already used'; end if;
      update public.econ_live_rooms set round=r.round+1, round_kind=kind, prompt=task.question, options=task.options,
        answer=task.answer, deadline=clock_timestamp()+interval '100 seconds', used=array_append(r.used,task.ref),
        round_visual=case when kind='quiz' then null else payload->'visual' end where code=r.code;
      if kind='quiz' then
        update public.econ_live_rooms set used=array_append(used,'quiz-text:'||md5(regexp_replace(lower(task.question),'[^[:alnum:]]','','g'))) where code=r.code;
      end if;
    else
      if r.deadline is null or (payload->>'round')::integer is distinct from r.round
        or choice is null or choice='null'::jsonb then raise exception 'Round closed'; end if;
      remaining := extract(epoch from r.deadline-clock_timestamp());
      if remaining<=0 then raise exception 'Round closed'; end if;
      round_points := case
        when choice=r.answer then 100+floor(least(remaining,100))::integer
        when r.round_kind in ('graph','match') and jsonb_typeof(choice)='array' and jsonb_typeof(r.answer)='array'
          and jsonb_array_length(choice)=3 and jsonb_array_length(r.answer)=3 then
          (select round(count(*)*100.0/3)::integer from generate_series(0,2) i where choice->i=r.answer->i)
        else 0 end;
      update public.econ_live_players set answered_round=r.round, last_answer=choice, response_count=response_count+1,
        correct_count=correct_count+case when choice=r.answer then 1 else 0 end,
        score=score+round_points
        where code=r.code and player=uid and answered_round<r.round;
    end if;
    base := public.econ_live_game('state',room_code);
  elsif operation='close' then
    select * into r from public.econ_live_rooms where code=upper(btrim(room_code)) for update;
    if r.deadline>clock_timestamp() and (
      not exists(select from public.econ_live_players where code=r.code)
      or exists(select from public.econ_live_players where code=r.code and answered_round<>r.round)
    ) then raise exception 'Waiting for answers'; end if;
    base := public.econ_live_game('close',room_code);
  else
    base := public.econ_live_game(operation,room_code);
  end if;
  select * into r from public.econ_live_rooms where code=base->>'code';
  return base || jsonb_build_object('topic',r.topic,'roundKind',r.round_kind,'visual',r.round_visual,
    'nextKind',case when r.host=uid then r.round_plan[r.round+1] end,'fixedRounds',r.round_plan is not null,
    'serverNow',clock_timestamp(),
    'top',coalesce((select jsonb_agg(jsonb_build_object('name',s.name,'score',s.score) order by s.score desc,s.name,s.player)
      from (select name,score,player from public.econ_live_players where code=r.code order by score desc,name,player limit 3) s),'[]'),
    'ranking',case when r.finished or r.host=uid then (select coalesce(jsonb_agg(jsonb_build_object('name',name,'score',score,'correct',correct_count,'responses',response_count) order by score desc,name,player),'[]') from public.econ_live_players where code=r.code) end,
    'personal',(select jsonb_build_object('place',place,'score',score,'correct',correct_count,'responses',response_count)
      from (select player, score, correct_count, response_count, row_number() over(order by score desc,name,player) as place
        from public.econ_live_players where code=r.code) standings where player=uid),
    'distribution',case when (base->>'closed')::boolean and (r.round_kind='quiz' or jsonb_typeof(r.answer)='number') then
      (select jsonb_agg((select count(*) from public.econ_live_players where code=r.code and answered_round=r.round and last_answer=to_jsonb(i)) order by i)
       from generate_series(0,jsonb_array_length(r.options)-1) i) end);
end;
$$;
revoke all on function public.econ_live_mixed(text,text,jsonb) from public,anon;
grant execute on function public.econ_live_mixed(text,text,jsonb) to authenticated;
revoke execute on function public.econ_live_game(text,text,jsonb) from authenticated;
commit;
