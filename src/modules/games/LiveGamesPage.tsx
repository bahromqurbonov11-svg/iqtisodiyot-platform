import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';
import { Chart } from './GraphGame';
import { graphQuestions } from './graph/questions';

type Mode = 'quiz' | 'graph';
type Room = {
  code: string; mode: Mode; host: boolean; round: number; prompt: string | null; options: string[] | null;
  deadline: string | null; closed: boolean; finished: boolean; answer: number | number[] | null;
  own: number | number[] | null; used: string[] | null; players: number; answered: number;
  ranking: { name: string; score: number }[] | null; distribution: number[] | null;
};
const titles = { quiz: 'Jonli viktorina', graph: 'Jonli grafikni boshqarish' };
const ranges = [
  { label: 'Talab egri chizig‘i', values: ['Keskin kamayadi', 'Biroz kamayadi', 'O‘zgarmaydi', 'Biroz ortadi', 'Keskin ortadi'], start: -2 },
  { label: 'Taklif egri chizig‘i', values: ['Keskin kamayadi', 'Biroz kamayadi', 'O‘zgarmaydi', 'Biroz ortadi', 'Keskin ortadi'], start: -2 },
  { label: 'Bozor narxi avvalgiga nisbatan', values: ['Pasayadi', 'O‘zgarmaydi', 'Oshadi'], start: -1 },
];

export function LiveGamesPage() {
  const { user } = useAuth();
  return <LiveGame key={user?.id ?? 'guest'} />;
}

function LiveGame() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get('tur') === 'graph' ? 'graph' : 'quiz';
  const [code, setCode] = useState(params.get('xona') ?? '');
  const [topic, setTopic] = useState(1);
  const [room, setRoom] = useState<Room>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const sequence = useRef(0);
  const [seconds, setSeconds] = useState(45);
  const roomId = room?.code;

  async function action(operation: string, payload: object = {}, overrideCode = roomId ?? code) {
    if (locked.current) return;
    locked.current = true;
    const version = ++sequence.current;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_live_game', { operation, room_code: overrideCode, payload });
    if (version === sequence.current) {
      if (error || !data) {
        setMessage(operation === 'join' ? 'Xona topilmadi yoki mashg‘ulot tugagan.'
          : error?.message === 'Question bank exhausted' ? 'Bu mavzudagi barcha savollar berildi.'
          : 'Amal bajarilmadi. Xona holatini tekshirib, qayta urining.');
      } else {
        const next = data as Room;
        setRoom(next);
        if (operation === 'create' || operation === 'join') {
          setParams({ tur: next.mode, xona: next.code }, { replace: true });
        }
      }
    }
    setBusy(false);
    locked.current = false;
  }

  useEffect(() => {
    if (!roomId || room?.finished) return;
    let active = true;
    let polling = false;
    async function refresh() {
      if (locked.current || polling || document.hidden) return;
      polling = true;
      const version = sequence.current;
      const { data, error } = await supabase.rpc('econ_live_game', { operation: 'state', room_code: roomId });
      polling = false;
      if (active && version === sequence.current && !error && data) setRoom(data);
    }
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [roomId, room?.finished]);

  useEffect(() => {
    if (!room?.deadline || room.closed) return;
    const deadline = Date.parse(room.deadline);
    const tick = () => setSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [room?.deadline, room?.closed]);

  function start() {
    if (room?.mode === 'graph') {
      const remaining = graphQuestions.filter(q => !room.used?.includes('graph:' + q.id));
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      if (next) void action('start', next);
      else setMessage('Barcha grafik topshiriqlari berildi.');
    } else void action('start');
  }

  return <div className="container page stack">
    <PageHeader title={titles[room?.mode ?? mode]} crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Jonli mashg‘ulot' }]} />
    {!user ? <Card title="Mashg‘ulotga kirish"><p>Telefoningizda sayt hisobiga kiring, so‘ng o‘qituvchi bergan xona kodini kiriting.</p>
      <Button to={paths.login + (code ? '?tur=' + mode + '&xona=' + encodeURIComponent(code) : '')}>Tizimga kirish</Button></Card> : !room ? <>
      <Card title="Xonaga qo‘shilish">
        <form className="stack" onSubmit={event => { event.preventDefault(); void action('join'); }}>
          <label htmlFor="live-code">Xona kodi</label>
          <input id="live-code" className="search-control" value={code} maxLength={6} autoCapitalize="characters"
            onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, ''))} />
          <Button type="submit" disabled={busy || code.length !== 6}>Qo‘shilish</Button>
        </form>
      </Card>
      {user.role === 'admin' && <Card title="Mashg‘ulot ochish"><div className="stack">
        {mode === 'quiz' && <label>Mavzu<select className="search-control" value={topic} onChange={event => setTopic(Number(event.target.value))}>
          {catalogService.getTopics().data.map(t => <option key={t.id} value={t.globalOrder}>{t.globalOrder}. {t.title}</option>)}
        </select></label>}
        <Button disabled={busy} onClick={() => void action('create', { mode, topic: mode === 'graph' ? 6 : topic })}>Xona yaratish</Button>
      </div></Card>}
    </> : <>
      <Card title={'Xona kodi ' + room.code}>
        <p>{room.players} ta ishtirokchi{room.round > 0 && ' · ' + room.answered + ' ta javob'}</p>
        {room.host && <div className="presentation-actions">
          <Button variant="secondary" onClick={async () => {
            try { await navigator.clipboard.writeText(window.location.href); setMessage('Xona havolasi nusxalandi.'); }
            catch { setMessage('Xona kodini talabalarga yuboring.'); }
          }}>Havolani nusxalash</Button>
          {!room.finished && <>
            <Button disabled={busy || (room.round > 0 && !room.closed)} onClick={start}>{room.round ? 'Keyingi raund' : 'Birinchi raund'}</Button>
            {room.round > 0 && !room.closed && <Button disabled={busy} variant="secondary" onClick={() => void action('close')}>Javoblarni yopish</Button>}
            <Button disabled={busy} variant="secondary" onClick={() => void action('finish')}>Mashg‘ulotni yakunlash</Button>
          </>}
        </div>}
      </Card>
      {room.prompt && <Card title={room.round + '-raund'} subtitle={room.closed ? 'Raund yopildi' : seconds + ' soniya qoldi'}>
        <div className="stack">
          <p><strong>{room.prompt}</strong></p>
          {room.mode === 'quiz' ? room.options?.map((option, i) => <button key={i} type="button"
            className={'test-option' + (room.own === i ? ' is-picked' : '')}
            disabled={busy || room.host || room.closed || seconds <= 0 || room.own !== null}
            onClick={() => void action('answer', { round: room.round, answer: i })}>
            {String.fromCharCode(65 + i)}. {option}
            {room.closed && <> · {room.distribution?.[i] ?? 0} ta{room.answer === i ? ' · To‘g‘ri javob' : ''}</>}
          </button>) : <GraphRound key={room.round} room={room} disabled={busy || seconds <= 0}
            submit={answer => void action('answer', { round: room.round, answer })} />}
          {room.own !== null && <p role="status">{room.closed
            ? (JSON.stringify(room.own) === JSON.stringify(room.answer) ? 'Javobingiz to‘g‘ri.' : 'Javobingiz xato.')
            : 'Javobingiz qabul qilindi.'}</p>}
        </div>
      </Card>}
      {!room.round && !room.finished && <p role="status">O‘qituvchi birinchi raundni boshlashini kuting.</p>}
      {room.ranking && <Card title={room.finished ? 'Yakuniy reyting' : 'Joriy reyting'}>
        {room.ranking.length ? <ol>{room.ranking.map((row, i) => <li key={i}>{i + 1}. {row.name} · {row.score} ball</li>)}</ol>
          : <p>Ishtirokchilar yo‘q.</p>}
      </Card>}
      {room.finished && <Button to={paths.games} variant="secondary">O‘yinlarga qaytish</Button>}
    </>}
    {message && <p role="status">{message}</p>}
  </div>;
}

function GraphRound({ room, disabled, submit }: { room: Room; disabled: boolean; submit: (answer: number[]) => void }) {
  const [values, setValues] = useState([0, 0, 0]);
  const frozen = disabled || room.host || room.closed || room.own !== null;
  return <div className="stack">
    <Chart values={room.closed && Array.isArray(room.answer) ? room.answer : Array.isArray(room.own) ? room.own : values} />
    {ranges.map((range, index) => <label key={range.label}>{range.label}
      <select className="search-control" value={values[index]} disabled={frozen} onChange={event => {
        const value = Number(event.target.value);
        setValues(rows => rows.map((entry, i) => i === index ? value : entry));
      }}>
        {range.values.map((label, i) => <option key={label} value={range.start + i}>{label}</option>)}
      </select>
    </label>)}
    {!room.host && !room.closed && <Button disabled={frozen} onClick={() => submit(values)}>Javobni yuborish</Button>}
    {room.closed && Array.isArray(room.answer) && <p>To‘g‘ri javob · {room.answer.map((answer, i) => ranges[i].values[answer - ranges[i].start]).join(' / ')}</p>}
  </div>;
}
