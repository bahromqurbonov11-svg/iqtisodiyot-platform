begin;
create table if not exists public.econ_live_rooms (
  code text primary key,
  host uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('quiz', 'graph')),
  topic integer not null check (topic between 1 and 25),
  round integer not null default 0,
  prompt text,
  options jsonb,
  answer jsonb,
  deadline timestamptz,
  finished boolean not null default false,
  used text[] not null default '{}',
  expires_at timestamptz not null default now() + interval '4 hours'
);
create table if not exists public.econ_live_players (
  code text references public.econ_live_rooms on delete cascade,
  player uuid references auth.users(id) on delete cascade,
  name text not null,
  score integer not null default 0,
  answered_round integer not null default 0,
  last_answer jsonb,
  primary key (code, player)
);
alter table public.econ_live_rooms enable row level security;
alter table public.econ_live_players enable row level security;
revoke all on public.econ_live_rooms, public.econ_live_players from public, anon, authenticated;

create or replace function public.econ_live_game(operation text, room_code text, payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  r public.econ_live_rooms;
  p public.econ_live_players;
  q record;
  choice jsonb := payload->'answer';
  candidate text;
  closed boolean;
begin
  if uid is null then raise exception 'Sign-in required'; end if;
  if operation = 'create' then
    if not coalesce(public.is_admin(), false) then raise exception 'Administrator required'; end if;
    loop
      candidate := upper(substr(gen_random_uuid()::text,1,6));
      insert into public.econ_live_rooms (code, host, mode, topic)
        values (candidate, uid, payload->>'mode', (payload->>'topic')::int)
        on conflict (code) do nothing returning * into r;
      exit when found;
    end loop;
  else
    if operation = 'state' then
      select * into r from public.econ_live_rooms where code=upper(btrim(room_code));
    else
      select * into r from public.econ_live_rooms where code=upper(btrim(room_code)) for update;
    end if;
    if r.code is null or r.expires_at <= clock_timestamp() then raise exception 'Room unavailable'; end if;

    if operation = 'join' and uid <> r.host then
      if r.finished then raise exception 'Room finished'; end if;
      insert into public.econ_live_players(code,player,name)
      select r.code, uid, coalesce(nullif(btrim(concat_ws(' ',first_name,last_name)),''),'Talaba')
      from public.profiles where id=uid
      on conflict do nothing;
    end if;

    select * into p from public.econ_live_players where code=r.code and player=uid;
    if uid <> r.host and p.player is null then raise exception 'Join required'; end if;

    if operation in ('start','close','finish') then
      if uid <> r.host or not coalesce(public.is_admin(),false) or r.finished then raise exception 'Host required'; end if;
      if operation = 'start' then
        if r.deadline > clock_timestamp() then raise exception 'Close the current round first'; end if;
        if r.mode='quiz' then
          select t.question, shuffled.options, shuffled.answer, t.bank || ':' || t.source_number as ref into q
          from (select * from public.econ_test_questions
            where topic=r.topic and not (bank || ':' || source_number = any(r.used)) order by random() limit 1) t
          cross join lateral (
            select jsonb_agg(o.option order by o.position) as options,
              to_jsonb(max(o.position-1) filter (where o.original-1=t.correct_index)) as answer
            from (select source.option, source.original, row_number() over(order by random()) as position
              from unnest(t.options) with ordinality source(option,original)) o
          ) shuffled;
        else
          if jsonb_typeof(choice) is distinct from 'array' or jsonb_array_length(choice) <> 3
            or length(coalesce(payload->>'prompt','')) not between 1 and 1500 then raise exception 'Invalid task'; end if;
          select payload->>'prompt' as question, null::jsonb as options, choice as answer,
            'graph:' || (payload->>'id') as ref into q;
        end if;
        if q.question is null then raise exception 'Question bank exhausted'; end if;
        update public.econ_live_rooms set round=r.round+1, prompt=q.question, options=q.options,
          answer=q.answer, deadline=clock_timestamp()+interval '45 seconds', used=array_append(r.used,q.ref)
          where code=r.code returning * into r;
      else
        update public.econ_live_rooms set deadline=least(deadline,clock_timestamp()),
          finished=(operation='finish') where code=r.code returning * into r;
      end if;
    elsif operation = 'answer' then
      if p.player is null or r.finished or r.deadline is null or r.deadline <= clock_timestamp()
         or (payload->>'round')::int is distinct from r.round then raise exception 'Round closed'; end if;
      if choice is null or (r.mode='quiz' and choice not in ('0','1','2','3'))
        or (r.mode='graph' and jsonb_typeof(choice) is distinct from 'array') then raise exception 'Invalid answer'; end if;
      update public.econ_live_players set answered_round=r.round, last_answer=choice,
        score=score+case when choice=r.answer then 1 else 0 end
        where code=r.code and player=uid and answered_round<r.round returning * into p;
      if not found then select * into p from public.econ_live_players where code=r.code and player=uid; end if;
    elsif operation not in ('join','state') then raise exception 'Unknown operation';
    end if;
  end if;

  closed := r.round>0 and (r.finished or r.deadline <= clock_timestamp());
  return jsonb_build_object(
    'code',r.code,'mode',r.mode,'topic',r.topic,'host',r.host=uid,'round',r.round,'prompt',r.prompt,
    'options',r.options,'deadline',r.deadline,'closed',closed,'finished',r.finished,
    'answer',case when closed or r.host=uid then r.answer end,
    'own',case when p.answered_round=r.round then p.last_answer end,'used',case when r.host=uid then r.used end,
    'answered',(select count(*) from public.econ_live_players where code=r.code and answered_round=r.round and r.round>0),
    'players',(select count(*) from public.econ_live_players where code=r.code),
    'ranking',case when closed or r.finished then (select coalesce(jsonb_agg(jsonb_build_object('name', name,'score',score) order by score desc,name),'[]')
      from public.econ_live_players where code=r.code) end,
    'distribution',case when closed and r.mode='quiz' then (select jsonb_agg(
      (select count(*) from public.econ_live_players where code=r.code and answered_round=r.round and last_answer=to_jsonb(i))
      order by i) from generate_series(0,3) i) end
  );
end;
$$;
revoke all on function public.econ_live_game(text,text,jsonb) from public,anon;
grant execute on function public.econ_live_game(text,text,jsonb) to authenticated;
commit;
