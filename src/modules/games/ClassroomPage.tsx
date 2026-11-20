import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Eye, Flag, Pause, Play, RotateCcw, Trophy, Users, X } from 'lucide-react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { topicConcepts } from '@/data/topicConcepts';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

/**
 * DARS REJIMI — o‘qituvchi boshqaradigan jamoaviy o‘yinlar sahifasi.
 * Birinchi o‘yin: "Atama bellashuvi". Guruhlar, ball jadvali va taymer shu yerda.
 * Natijalar faqat dars davomida ekranda turadi (saqlanmaydi).
 */
type Phase = 'ask' | 'answer' | 'reveal';
interface Round { term: string; definition: string; topic: number }

const COLORS = ['#1f8f78', '#2b6cb0', '#c2562d', '#7a3fb0', '#b8860b', '#c0453a'];
/** To‘g‘ri javob bali urinish tartibiga bog‘liq: birinchi guruh 10, keyingilar kamroq oladi. */
const RIGHT_BY_TURN = [10, 7, 5, 3];
const WRONG = -5;
const rightFor = (attempt: number) => RIGHT_BY_TURN[Math.min(attempt, RIGHT_BY_TURN.length - 1)];

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function ClassroomPage() {
  const topics = catalogService.getTopics().data;
  const [setup, setSetup] = useState({ groups: 4, rounds: 10, seconds: 30, scope: 'all' });
  const [names, setNames] = useState(() => Array.from({ length: 6 }, (_, i) => (i + 1) + '-guruh'));
  const [rounds, setRounds] = useState<Round[]>();
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('ask');
  const [turn, setTurn] = useState<number | null>(null);
  const [out, setOut] = useState<number[]>([]);
  const [left, setLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [peek, setPeek] = useState(false);
  const [gain, setGain] = useState<{ group: number; value: number; id: number } | null>(null);
  const deadline = useRef(0);

  const names6 = names.slice(0, setup.groups);

  function start() {
    const pool: Round[] = topicConcepts.flatMap((list, i) => {
      const topic = i + 1;
      if (setup.scope === 'p1' && topic > 12) return [];
      if (setup.scope === 'p2' && topic <= 12) return [];
      if (/^t\d+$/.test(setup.scope) && topic !== Number(setup.scope.slice(1))) return [];
      return list.map(([term, definition]) => ({ term, definition, topic }));
    });
    const chosen = shuffle(pool).slice(0, setup.rounds);
    setRounds(chosen);
    setScores(Array(setup.groups).fill(0));
    begin(0);
  }

  function begin(i: number) {
    setIndex(i); setPhase('ask'); setTurn(null); setOut([]); setPaused(false); setPeek(false);
    deadline.current = Date.now() + setup.seconds * 1000;
    setLeft(setup.seconds);
  }

  useEffect(() => {
    if (!rounds || phase === 'reveal' || paused) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) { window.clearInterval(timer); setPhase('reveal'); setTurn(null); }
    }, 250);
    return () => window.clearInterval(timer);
  }, [rounds, index, phase, paused]);

  function buzz(group: number) {
    if (phase !== 'ask' || out.includes(group) || paused) return;
    setTurn(group); setPhase('answer'); setPeek(false);
  }

  function judge(correct: boolean) {
    if (turn === null) return;
    const value = correct ? rightFor(out.length) : WRONG;
    setScores(s => s.map((v, i) => i === turn ? v + value : v));
    setGain({ group: turn, value, id: Date.now() });
    if (correct) { setPhase('reveal'); setTurn(null); return; }
    const nextOut = [...out, turn];
    setOut(nextOut);
    setTurn(null);
    if (nextOut.length >= setup.groups) setPhase('reveal');
    else {
      // Taymer to‘xtamaydi: qolgan guruhlar o‘sha raund vaqti ichida, kamroq ball evaziga javob beradi.
      setPeek(false);
      setPhase('ask');
    }
  }

  useEffect(() => {
    if (!rounds) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const n = Number(e.key);
      if (n >= 1 && n <= setup.groups) buzz(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function togglePause() {
    if (paused) deadline.current = Date.now() + left * 1000;
    setPaused(p => !p);
  }

  const finished = rounds && index >= rounds.length;
  const ranking = useMemo(() => scores.map((score, i) => ({ i, score })).sort((a, b) => b.score - a.score), [scores]);
  const round = rounds?.[index];
  const topicTitle = round ? topics.find(t => t.globalOrder === round.topic)?.title : '';

  if (!rounds) {
    return (
      <div className="container page">
        <PageHeader title="Dars rejimi" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Dars rejimi' }]}
          description="O‘qituvchi boshqaradigan jamoaviy o‘yin: guruhlar, ball jadvali va taymer. Birinchi o‘yin — Atama bellashuvi." />
        <Card title="Atama bellashuvi" subtitle="Ta’rif o‘qiladi — qaysi guruh atamani birinchi topadi?">
          <div className="cls-setup">
            <label>Guruhlar soni
              <select className="search-control" value={setup.groups} onChange={e => setSetup({ ...setup, groups: Number(e.target.value) })}>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} ta guruh</option>)}
              </select></label>
            <label>Raundlar soni
              <select className="search-control" value={setup.rounds} onChange={e => setSetup({ ...setup, rounds: Number(e.target.value) })}>
                {[6, 8, 10, 12, 15].map(n => <option key={n} value={n}>{n} ta raund{n === 10 ? ' (~30 daqiqa)' : ''}</option>)}
              </select></label>
            <label>Bir raund vaqti
              <select className="search-control" value={setup.seconds} onChange={e => setSetup({ ...setup, seconds: Number(e.target.value) })}>
                {[20, 30, 45, 60].map(n => <option key={n} value={n}>{n} soniya</option>)}
              </select></label>
            <label>Atamalar
              <select className="search-control" value={setup.scope} onChange={e => setSetup({ ...setup, scope: e.target.value })}>
                <option value="all">Barcha mavzular</option>
                <option value="p1">1-qism (1–12-mavzu)</option>
                <option value="p2">2-qism (13–25-mavzu)</option>
                {topics.map(t => <option key={t.id} value={'t' + t.globalOrder}>{t.globalOrder}-mavzu · {t.title}</option>)}
              </select></label>
          </div>
          <h3 className="mt-4">Guruh nomlari</h3>
          <div className="cls-names">
            {names.slice(0, setup.groups).map((name, i) => (
              <label key={i} style={{ ['--gc' as string]: COLORS[i] }}><span className="cls-dot" />
                <input className="search-control" value={name} maxLength={24} aria-label={(i + 1) + '-guruh nomi'}
                  onChange={e => setNames(list => list.map((v, k) => k === i ? e.target.value : v))} />
              </label>
            ))}
          </div>
          <ol className="small muted cls-rules">
            <li>Ekranda atamaning ta’rifi chiqadi. Guruhlar kengashadi.</li>
            <li>Tayyor guruh o‘z tugmasini bosadi (yoki klaviaturada guruh raqamini): birinchi bosgan javob beradi. Guruh tanlangandan keyin ham taymer to‘xtamaydi.</li>
            <li>Javob ekranda ko‘rinmaydi: uni faqat o‘qituvchi “Javobni ko‘rish” tugmasi bilan ko‘radi va "To‘g‘ri" yoki "Noto‘g‘ri" ({WRONG}) ni bosadi.</li>
            <li>Javob xato bo‘lsa, qolgan guruhlar o‘sha raund vaqti ichida javob bera oladi, lekin kamroq ball oladi: 1-guruh {RIGHT_BY_TURN[0]}, 2-guruh {RIGHT_BY_TURN[1]}, 3-guruh {RIGHT_BY_TURN[2]}, keyingilari {RIGHT_BY_TURN[3]} ball.</li>
          </ol>
          <Button className="mt-4" icon={<Play size={16} />} onClick={start}>O‘yinni boshlash</Button>
          <p className="small muted mt-3"><Badge tone="demo">DEMO</Badge> Natijalar dars davomida ekranda turadi, saqlanmaydi.</p>
        </Card>
      </div>
    );
  }

  if (finished) {
    const top = ranking[0].score;
    return (
      <div className="container page">
        <PageHeader title="Dars rejimi · Natija" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Dars rejimi' }]} />
        <Card title="Yakuniy ball jadvali">
          <ol className="cls-final">
            {ranking.map((r, place) => (
              <li key={r.i} style={{ ['--gc' as string]: COLORS[r.i] }} className={r.score === top ? 'is-win' : ''}>
                <b>{place + 1}</b><span className="cls-dot" /><strong>{names6[r.i]}</strong>
                {r.score === top && <Trophy size={18} aria-label="G‘olib" />}<em>{r.score} ball</em>
              </li>
            ))}
          </ol>
          <div className="presentation-actions mt-4">
            <Button icon={<RotateCcw size={16} />} onClick={() => { setRounds(undefined); }}>Yangi o‘yin</Button>
            <Button variant="secondary" to={paths.games}>O‘yinlarga qaytish</Button>
          </div>
        </Card>
      </div>
    );
  }

  const urgent = left <= 5 && phase === 'ask';
  return (
    <div className="container page cls-page">
      <PageHeader title="Atama bellashuvi" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Dars rejimi' }]}
        actions={<Button variant="secondary" size="sm" onClick={() => { if (window.confirm('O‘yin to‘xtatilsinmi? Ballar yo‘qoladi.')) setRounds(undefined); }}>To‘xtatish</Button>} />
      <div className="cls-grid">
        <section className="cls-stage" aria-live="polite">
          <header className="cls-stage__top">
            <Badge tone="neutral" icon={<Flag size={12} />}>{index + 1} / {rounds.length} raund</Badge>
            <span className="muted small">{round?.topic}-mavzu · {topicTitle}</span>
            <button type="button" className="cls-pause" onClick={togglePause} aria-label={paused ? 'Davom ettirish' : 'To‘xtatib turish'} disabled={phase === 'reveal'}>
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <span className={'cls-timer' + (urgent ? ' is-urgent' : '')} role="timer" aria-label={left + ' soniya qoldi'}>{phase === 'reveal' ? '—' : left}</span>
          </header>
          <div className="cls-bar" aria-hidden><i style={{ width: phase === 'reveal' ? '0%' : (left / setup.seconds * 100) + '%' }} /></div>
          <p className="cls-def"><small>Ta’rif:</small> {round?.definition}</p>
          {phase === 'reveal' && <div className="cls-answer"><Eye size={20} aria-hidden /> Javob: <strong>{round?.term}</strong></div>}
          {phase === 'answer' && turn !== null && (
            <div className="cls-judge" style={{ ['--gc' as string]: COLORS[turn] }}>
              <p><span className="cls-dot" /> <strong>{names6[turn]}</strong> javob beryapti.</p>
              <p className="small muted">Javob ekranda yashirilgan. O‘qituvchi uni tekshirish uchun ko‘radi:</p>
              <div className="cls-peek" style={{ display: "flex", gap: 12, alignItems: "center", margin: "8px 0" }}>
                {peek ? <b className="cls-secret">{round?.term}</b> : <span className="muted">••••••••</span>}
                <Button variant="secondary" size="sm" icon={<Eye size={14} />} onClick={() => setPeek(v => !v)}>{peek ? 'Yashirish' : 'Javobni ko‘rish'}</Button>
              </div>
              <div className="presentation-actions">
                <Button icon={<Check size={16} />} onClick={() => judge(true)}>To‘g‘ri +{rightFor(out.length)}</Button>
                <Button variant="secondary" icon={<X size={16} />} onClick={() => judge(false)}>Noto‘g‘ri {WRONG}</Button>
              </div>
            </div>
          )}
          {phase === 'ask' && out.length > 0 && <p role="status" className="small muted">Oldingi javob xato. Endi to‘g‘ri javob uchun {rightFor(out.length)} ball beriladi.</p>}
          {phase === 'ask' && <div className="cls-buzz">
            {names6.map((name, i) => (
              <button key={i} type="button" className="cls-buzz__btn" style={{ ['--gc' as string]: COLORS[i] }}
                disabled={out.includes(i) || paused} onClick={() => buzz(i)}>
                <kbd>{i + 1}</kbd> {name}{out.includes(i) && <small> · xato</small>}
              </button>
            ))}
          </div>}
          {paused && <p role="status" className="center muted">Taymer to‘xtatib turilgan.</p>}
          {phase === 'reveal' && <Button className="mt-3" onClick={() => begin(index + 1)}>
            {index + 1 >= rounds.length ? 'Natijani ko‘rish' : 'Keyingi raund'}</Button>}
        </section>
        <aside className="cls-score" aria-label="Ball jadvali">
          <h2><Users size={18} aria-hidden /> Ball jadvali</h2>
          <ol>
            {ranking.map((r, place) => (
              <li key={r.i} style={{ ['--gc' as string]: COLORS[r.i] }} className={turn === r.i ? 'is-turn' : ''}>
                <b>{place + 1}</b><span className="cls-dot" /><strong>{names6[r.i]}</strong><em>{r.score}</em>
                {gain?.group === r.i && <span key={gain.id} className={'cls-gain' + (gain.value < 0 ? ' is-neg' : '')}>{gain.value > 0 ? '+' : ''}{gain.value}</span>}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
