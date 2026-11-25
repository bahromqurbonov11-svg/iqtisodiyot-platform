import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';
import { Chart, GraphControls } from './GraphGame';
import { graphQuestions } from './graph/questions';
import { topicGameBank } from '@/data/topicGames';

type Visual = { title: string; values: number[]; labels: string[] };
type Room = {
  code: string; topic: number; roundKind: 'quiz' | 'match' | 'graph' | null; visual: Visual | null;
  host: boolean; round: number; prompt: string | null; options: string[] | null;
  nextKind: 'quiz' | 'match' | 'graph' | null; fixedRounds: boolean; serverNow: string;
  deadline: string | null; closed: boolean; finished: boolean; answer: number | number[] | null;
  own: number | number[] | null; used: string[] | null; players: number; answered: number;
  top: { name: string; score: number }[];
  ranking: { name: string; score: number; correct: number; responses: number }[] | null; distribution: number[] | null;
};
const titles = { quiz: 'Viktorina', match: 'Tushunchalarni moslashtirish', graph: 'Grafikni boshqarish' };
const shuffle = <T,>(values: readonly T[]) => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
const ROUND_SECONDS = 100;

export function LiveGamesPage() {
  const { user } = useAuth();
  return <LiveGame key={user?.id ?? 'guest'} />;
}

function LiveGame() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('xona') ?? '');
  const [topic, setTopic] = useState(11);
  const [room, setRoom] = useState<Room>();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const sequence = useRef(0);
  const [now, setNow] = useState(Date.now);
  const clockOffset = useRef(0);
  const roomId = room?.code;
  const seconds = room?.deadline
    ? Math.max(0, Math.min(ROUND_SECONDS, Math.ceil((Date.parse(room.deadline) - now - clockOffset.current) / 1000)))
    : ROUND_SECONDS;

  async function action(operation: string, payload: object = {}, overrideCode = roomId ?? code) {
    if (locked.current) return;
    locked.current = true;
    const version = ++sequence.current;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_live_mixed', { operation, room_code: overrideCode, payload });
    if (version === sequence.current) {
      if (error || !data) {
        setMessage(operation === 'join' ? 'Xona topilmadi yoki mashg‘ulot tugagan.'
          : error?.message === 'Round closed' ? 'Raund vaqti tugadi. Keyingi raundni kuting.'
          : error?.message === 'Waiting for answers' ? 'Ayrim talabalar hali javob bermadi.'
          : error?.message === 'Question bank exhausted' ? 'Bu mavzudagi barcha savollar berildi.'
          : 'Amal bajarilmadi. Xona holatini tekshirib, qayta urining.');
      } else {
        const next = data as Room;
        if (next.serverNow) clockOffset.current = Date.parse(next.serverNow) - Date.now();
        setNow(Date.now());
        setRoom(next);
        if (operation === 'create' || operation === 'join') {
          setParams({ xona: next.code }, { replace: true });
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
      const { data, error } = await supabase.rpc('econ_live_mixed', { operation: 'state', room_code: roomId });
      polling = false;
      if (active && version === sequence.current && !error && data) {
        if (data.serverNow) clockOffset.current = Date.parse(data.serverNow) - Date.now();
        setNow(Date.now());
        setRoom(data);
      }
    }
    const timer = window.setInterval(refresh, 1500);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [roomId, room?.finished]);

  useEffect(() => {
    if (!room?.deadline || room.closed) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [room?.deadline, room?.closed]);

  function start() {
    if (!room) return;
    const kind = room.fixedRounds ? room.nextKind : (['quiz', 'match', 'graph'] as const)[room.round % 3];
    if (!kind) return;
    if (kind === 'quiz') { void action('start'); return; }
    if (kind === 'match') {
      const candidates = Array.from({ length: room.topic }, (_, i) => room.topic - i);
      for (const number of candidates) {
        const pool = topicGameBank[number - 1];
        const prefix = 'match:' + number + '-';
        const used = (room.used ?? []).filter(id => id.startsWith(prefix))
          .flatMap(id => id.slice(prefix.length).split(',').map(Number));
        const indices = shuffle(pool.map((_, i) => i).filter(i => !used.includes(i)));
        if (indices.length < 3) continue;
        const chosen = indices.slice(0, 3);
        const options = shuffle(chosen);
        void action('start', { topic: number, id: number + '-' + chosen.join(','),
          prompt: chosen.map((i, position) => (position + 1) + '. ' + pool[i][1]).join('\n'),
          options: options.map(i => pool[i][0]), answer: chosen.map(i => options.indexOf(i)) });
        return;
      }
      setMessage('Moslashtirish uchun yangi atamalar qolmadi.');
      return;
    }
    const unused = graphQuestions.filter(item => !room.used?.includes('graph:6-' + item.id));
    const next = shuffle(unused)[0];
    if (next) void action('start', { ...next, topic: 6, id: '6-' + next.id });
  }

  return <div className="container page stack">
    <PageHeader title="Jonli aralash o‘yin" description="5 ta test, 3 ta moslashtirish va 2 ta grafik. Har bir raund uchun 100 soniya."
      crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Jonli mashg‘ulot' }]} />
    {!user ? <Card title="Mashg‘ulotga kirish"><p>Telefoningizda sayt hisobiga kiring, so‘ng o‘qituvchi bergan xona kodini kiriting.</p>
      <Button to={paths.login + (code ? '?xona=' + encodeURIComponent(code) : '')}>Tizimga kirish</Button></Card> : !room ? <>
      <Card title="Xonaga qo‘shilish">
        <form className="stack" onSubmit={event => { event.preventDefault(); void action('join'); }}>
          <label htmlFor="live-code">Xona kodi</label>
          <input id="live-code" className="search-control" value={code} maxLength={6} autoCapitalize="characters"
            onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, ''))} />
          <Button type="submit" disabled={busy || code.length !== 6}>Qo‘shilish</Button>
        </form>
      </Card>
      {user.role === 'admin' && <Card title="Mashg‘ulot ochish"><div className="stack">
        <label>Mavzu<select className="search-control" value={topic} onChange={event => setTopic(Number(event.target.value))}>
          {catalogService.getTopics().data.map(t => <option key={t.id} value={t.globalOrder}>{t.globalOrder}. {t.title}</option>)}
        </select></label>
        <Button disabled={busy} onClick={() => void action('create', { topic })}>Xona yaratish</Button>
      </div></Card>}
    </> : <>
      <Card title={'Xona kodi ' + room.code}>
        <p>{room.players} ta ishtirokchi{room.round > 0 && ' · ' + room.answered + ' ta javob'}
          {room.host && room.round > 0 && <> · <strong>{Math.max(0, room.players - room.answered)} ta javob bermagan</strong></>}
        </p>
        {room.host && <div className="presentation-actions">
          <Button variant="secondary" onClick={async () => {
            try { await navigator.clipboard.writeText(window.location.href); setMessage('Xona havolasi nusxalandi.'); }
            catch { setMessage('Xona kodini talabalarga yuboring.'); }
          }}>Havolani nusxalash</Button>
          {!room.finished && <>
            {(!room.fixedRounds || room.round < 10) && <Button disabled={busy || (room.round > 0 && !room.closed)} onClick={start}>{room.round ? 'Keyingi raund' : 'Birinchi raund'}</Button>}
            {room.round > 0 && !room.closed && room.players > 0 && room.answered === room.players &&
              <Button disabled={busy} onClick={() => void action('close')}>Raundni yakunlash</Button>}
            <Button disabled={busy} variant="secondary" onClick={() => void action('finish')}>Mashg‘ulotni yakunlash</Button>
          </>}
        </div>}
      </Card>
      {!room.finished && <Card title="Jonli top uchlik" subtitle="To‘g‘ri javob uchun 100 ball va tezlikka qarab 99 ballgacha qo‘shimcha ball.">
        {room.top.length ? <ol>{room.top.map((row, i) => <li key={i}>{i + 1}. {row.name} · {row.score} ball</li>)}</ol> : <p>Ishtirokchilar kutilmoqda.</p>}
      </Card>}
      {room.prompt && <Card title={room.round + (room.fixedRounds ? ' / 10' : '') + '-raund · ' + (room.roundKind ? titles[room.roundKind] : '')} subtitle={room.closed ? 'Raund yopildi' : seconds + ' soniya qoldi'}>
        <div className="stack">
          <p style={{ whiteSpace: 'pre-line' }}><strong>{room.prompt}</strong></p>
          {room.host && !room.closed && <p className="small muted">Bu o‘qituvchi oynasi. Javoblarni xonaga qo‘shilgan talabalar belgilaydi.</p>}
          {room.visual && <Card title={room.visual.title}>
            {room.visual.values.map((value, i) => <div key={i} className="analytics-bar">
              <span>{room.visual?.labels[i]} · {value}</span>
              <progress max={Math.max(...room.visual!.values.map(Math.abs), 1)} value={Math.abs(value)} aria-label={room.visual?.labels[i]} />
            </div>)}
          </Card>}
          {room.roundKind === 'match' ? <MatchRound key={room.round} room={room} disabled={busy || seconds <= 0}
            submit={answer => void action('answer', { round: room.round, answer })} />
          : room.options ? room.options.map((option, i) => <button key={i} type="button"
            className={'test-option' + (room.own === i || (room.closed && room.answer === i) ? ' is-picked' : '')}
            style={{ transform: 'none', boxSizing: 'border-box' }}
            disabled={busy || room.host || room.closed || seconds <= 0 || room.own != null}
            onClick={() => void action('answer', { round: room.round, answer: i })}>
            <b>{String.fromCharCode(65 + i)}</b>
            <span>{option}
              {room.closed && room.answered > 0 && room.distribution && <> · {room.distribution[i]} ta ovoz</>}
              {room.closed && room.answer === i && <> · <strong>To‘g‘ri javob</strong></>}
            </span>
          </button>) : <GraphRound key={room.round} room={room} disabled={busy || seconds <= 0}
            submit={answer => void action('answer', { round: room.round, answer })} />}
          {room.own != null && <p role="status">{room.closed
            ? (JSON.stringify(room.own) === JSON.stringify(room.answer) ? 'Javobingiz to‘g‘ri.' : 'Javobingiz xato.')
            : 'Javobingiz qabul qilindi.'}</p>}
          {room.closed && !room.answered && <p role="status">Bu raundda javob kelmadi.</p>}
        </div>
      </Card>}
      {!room.round && !room.finished && <p role="status">O‘qituvchi birinchi raundni boshlashini kuting.</p>}
      {room.ranking && <Card title={room.finished ? 'Yakuniy reyting' : 'Joriy reyting'}>
        {room.ranking.length ? <div className="table-wrap"><table className="table">
          <thead><tr><th>O‘rin</th><th>Talaba</th><th>Ball</th><th>To‘g‘ri javob</th><th>Yuborilgan javob</th></tr></thead>
          <tbody>{room.ranking.map((row, i) => <tr key={i}><td data-label="O‘rin">{i + 1}</td>
            <td data-label="Talaba">{row.name}</td><td data-label="Ball">{row.score}</td>
            <td data-label="To‘g‘ri javob">{row.correct}</td><td data-label="Yuborilgan javob">{row.responses}</td></tr>)}</tbody>
        </table></div>
          : <p>Ishtirokchilar yo‘q.</p>}
      </Card>}
      {room.finished && <Button to={paths.games} variant="secondary">O‘yinlarga qaytish</Button>}
    </>}
    {message && <p role="status">{message}</p>}
  </div>;
}

function MatchRound({ room, disabled, submit }: { room: Room; disabled: boolean; submit: (values: number[]) => void }) {
  const [values, setValues] = useState<number[]>(Array.isArray(room.own) ? room.own : [-1, -1, -1]);
  const frozen = disabled || room.host || room.closed || room.own != null;
  return <div className="stack">
    {values.map((value, i) => <label key={i}>{i + 1}-ta’rifga mos atama
      <select className="search-control" value={value} disabled={frozen}
        onChange={event => setValues(current => current.map((entry, j) => i === j ? Number(event.target.value) : entry))}>
        <option value={-1}>Atamani tanlang</option>
        {room.options?.map((option, j) => <option key={j} value={j} disabled={values.some((choice, k) => k !== i && choice === j)}>{option}</option>)}
      </select>
    </label>)}
    {!room.host && !room.closed && <Button disabled={frozen || values.includes(-1)} onClick={() => submit(values)}>Javobni yuborish</Button>}
    {room.closed && Array.isArray(room.answer) && <p>To‘g‘ri juftliklar · {room.answer.map((answer, i) => (i + 1) + '. ' + room.options?.[answer]).join(' · ')}</p>}
  </div>;
}

function GraphRound({ room, disabled, submit }: { room: Room; disabled: boolean; submit: (answer: number[]) => void }) {
  const [values, setValues] = useState([0, 0, 0]);
  const frozen = disabled || room.host || room.closed || room.own != null;
  const shown = room.closed && Array.isArray(room.answer) ? room.answer : Array.isArray(room.own) ? room.own : values;
  return <div className="stack">
    <Chart values={shown} />
    {room.closed && Array.isArray(room.answer) && <strong>To‘g‘ri javob</strong>}
    <GraphControls values={shown} onChange={setValues} disabled={frozen} />
    {!room.host && !room.closed && <Button disabled={frozen} onClick={() => submit(values)}>Javobni yuborish</Button>}
  </div>;
}
