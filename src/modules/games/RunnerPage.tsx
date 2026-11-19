import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';

type Player = { name: string; points: number };
type Quiz = { question: string; options: string[] };
type Phase = 'ready' | 'running' | 'loading' | 'quiz' | 'over';
const initial = () => ({ x: 520, y: 0, velocity: 0, counted: false, score: 0 });
const runner = (action: string, run?: string, choice?: number) =>
  supabase.rpc('econ_runner', { action, run_id: run ?? null, choice: choice ?? null });

export function RunnerPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('ready');
  const [quiz, setQuiz] = useState<Quiz>();
  const [score, setScore] = useState(0);
  const [frame, setFrame] = useState(initial);
  const [rank, setRank] = useState<Player[]>();
  const [message, setMessage] = useState('');
  const [missedTopic, setMissedTopic] = useState<number>();
  const [busy, setBusy] = useState(false);
  const world = useRef(initial());
  const run = useRef<string | undefined>(undefined);
  const track = useRef<HTMLButtonElement>(null);

  const refreshRank = useCallback(async () => {
    if (!user) return;
    const { data } = await runner('rank');
    if (data?.status === 'ok') setRank(data.players);
  }, [user]);

  useEffect(() => { void refreshRank(); }, [refreshRank]);

  const finish = useCallback(() => {
    setPhase('over');
    if (run.current) void runner('finish', run.current);
    void refreshRank();
  }, [refreshRank]);

  const checkpoint = useCallback(async () => {
    setPhase('loading');
    const { data, error } = await runner('question', run.current);
    if (error || data?.status !== 'ok') {
      setMessage('Marradagi savolni yuklab bo‘lmadi.');
      finish();
      return;
    }
    setQuiz(data);
    setPhase('quiz');
  }, [finish]);

  useEffect(() => {
    if (phase !== 'running') return;
    track.current?.focus({ preventScroll: true });
    let handle = 0;
    let last = 0;
    function tick(time: number) {
      const dt = last ? Math.min((time - last) / 1000, 0.035) : 0;
      last = time;
      const w = world.current;
      w.x -= (230 + Math.min(w.score * 2, 95)) * dt;
      w.y = Math.max(0, w.y + w.velocity * dt);
      w.velocity = w.y > 0 ? w.velocity - 920 * dt : 0;
      setFrame({ ...w });
      if (w.x < 101 && w.x + 23 > 72 && w.y < 32) { finish(); return; }
      if (!w.counted && w.x + 23 <= 72) {
        w.counted = true;
        w.score += 1;
        setScore(w.score);
        if (w.score % 15 === 0) { void checkpoint(); return; }
      }
      if (w.x < -25) { w.x = 500 + Math.random() * 130; w.counted = false; }
      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [phase, checkpoint, finish]);

  function jump() {
    if (phase === 'running' && world.current.y === 0) world.current.velocity = 420;
  }

  async function start() {
    setBusy(true);
    setMessage('');
    const { data, error } = await runner('start');
    setBusy(false);
    if (error || data?.status !== 'ok') {
      setMessage(data?.status === 'ineligible' ? 'Reytingli o‘yin Soliq oliy maktabi talabalari uchun.' : 'O‘yinni boshlashda xatolik yuz berdi.');
      return;
    }
    run.current = data.id;
    world.current = initial();
    setFrame(world.current);
    setScore(0);
    setMissedTopic(undefined);
    setPhase('running');
  }

  async function answer(choice: number) {
    if (busy || phase !== 'quiz') return;
    setBusy(true);
    const { data, error } = await runner('answer', run.current, choice);
    setBusy(false);
    if (data?.status === 'correct') {
      world.current.x = 520;
      world.current.y = 0;
      world.current.velocity = 0;
      world.current.counted = false;
      setFrame({ ...world.current });
      setQuiz(undefined);
      setPhase('running');
      void refreshRank();
    } else {
      setMissedTopic(data?.topic);
      setMessage(error ? 'Javobni tekshirib bo‘lmadi.' : 'Javob xato. Raund tugadi.');
      finish();
    }
  }

  const topic = catalogService.getTopics().data.find(t => t.globalOrder === missedTopic);

  return <div className="container page">
    <PageHeader title="Marraga yugurish" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Marraga yugurish' }]}
      description="To‘siqlardan sakrab o‘ting. Har 15 ballik marrada bitta savolga javob bering." />
    <div className="grid grid--2-1">
      <Card title={score + ' ball'}>
        <button ref={track} type="button" className="runner-track" aria-label="Sakrash" onClick={jump} onKeyDown={event => {
          if (event.key === 'ArrowUp') { event.preventDefault(); jump(); }
        }}>
          <svg viewBox="0 0 590 190" width="100%" aria-hidden="true">
            <rect width="590" height="190" fill="#eef6ed" />
            <circle cx="475" cy="45" r="22" fill="#e0bb6e" />
            <path d="M0 152Q75 78 160 152T310 152T460 152T610 152V190H0Z" fill="#c4ddca" />
            <path d="M0 157H590" stroke="#467660" strokeWidth="3" />
            <rect x={frame.x} y="125" width="23" height="32" rx="4" fill="#945633" />
            <rect x="72" y={126-frame.y} width="29" height="31" rx="7" fill="#1b5f4d" />
            <circle cx="93" cy={134-frame.y} r="2" fill="white" />
          </svg>
        </button>
        <div className="stack mt-3">
          {!user && <Button to={paths.login}>O‘ynash uchun kiring</Button>}
          {user && (phase === 'ready' || phase === 'over') && <Button disabled={busy} onClick={() => void start()}>{phase === 'over' ? 'Qayta o‘ynash' : 'Boshlash'}</Button>}
          {phase === 'running' && <p className="small muted">Sakrash uchun maydonni bosing yoki fokusda bo‘lganda Space tugmasini ishlating.</p>}
          {phase === 'loading' && <p role="status">Savol yuklanmoqda…</p>}
          {phase === 'quiz' && quiz && <div className="stack">
            <strong>{quiz.question}</strong>
            {quiz.options.map((option, i) => <button key={i} className="test-option" disabled={busy} onClick={() => void answer(i)}>{option}</button>)}
          </div>}
          {phase === 'over' && <strong>Raund natijasi: {score} ball</strong>}
          {message && <p role="status">{message}</p>}
          {topic && <Button variant="secondary" to={paths.topic(topic.id)}>{topic.title}</Button>}
        </div>
      </Card>
      <Card title="Talabalar reytingi">
        <p className="small muted">To‘g‘ri javob bilan tasdiqlangan eng yuqori marra hisoblanadi.</p>
        {!user && <p>Reytingni ko‘rish uchun tizimga kiring.</p>}
        {rank?.length === 0 && <p>Hozircha tasdiqlangan marra yo‘q.</p>}
        <ol className="stack stack--sm">
          {rank?.map((player, i) => <li key={i}><strong>{player.name}</strong> · {player.points} ball</li>)}
        </ol>
      </Card>
    </div>
  </div>;
}
