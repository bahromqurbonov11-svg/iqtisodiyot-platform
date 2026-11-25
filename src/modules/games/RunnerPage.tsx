import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';
import { GameTopThree, type RankedPlayer } from './GameTopThree';
import { saveGameRecord } from '@/modules/student/gameStats';

const MAX_LIVES = 3;
type Quiz = { question: string; options: string[] };
type Phase = 'ready' | 'running' | 'loading' | 'quiz' | 'over';
const initial = () => ({ x: 520, y: 0, velocity: 0, counted: false, score: 0, heights: [30] });
const encouragement = ['Diqqatni jamlang!', 'Yana bir to‘siq ortda!', 'Keyingi marraga yaqinlashyapsiz!', 'Shu sur’atda davom eting!'];
import { useAwayReset } from '@/services/useAwayReset';

const runner = (action: string, run?: string, choice?: number) =>
  supabase.rpc('econ_runner', { action, run_id: run ?? null, choice: choice ?? null });

/** Administrator uchun mahalliy rejim: server reytingiga yozilmaydi, savollar test bankidan olinadi. */
type BankItem = { question: string; options: string[]; correct_index: number; topic: number | null };
let adminBank: BankItem[] | undefined;
async function loadAdminBank() {
  if (adminBank) return adminBank;
  const { data, error } = await supabase.rpc('econ_admin_test_bank');
  if (error || !Array.isArray(data)) return undefined;
  adminBank = (data as BankItem[]).filter(q => Array.isArray(q.options) && q.options.length === 4);
  return adminBank;
}

export function RunnerPage() {
  const [attempt, setAttempt] = useState(0);
  return <RunnerSession key={attempt} discard={() => setAttempt(value => value + 1)} />;
}

function RunnerSession({ discard }: { discard: () => void }) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('ready');
  useAwayReset(phase !== 'ready' && phase !== 'over', discard);
  const [quiz, setQuiz] = useState<Quiz>();
  const [quizResult, setQuizResult] = useState<'correct' | 'wrong' | 'error'>();
  const [score, setScore] = useState(0);
  const [frame, setFrame] = useState(initial);
  const [rank, setRank] = useState<RankedPlayer[]>();
  const [message, setMessage] = useState('');
  const [missedTopic, setMissedTopic] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [lives, setLives] = useState(MAX_LIVES);
  const livesRef = useRef(MAX_LIVES);
  const immune = useRef(0);
  const [speed, setSpeed] = useState(1);
  const [pep, setPep] = useState(encouragement[0]);
  const pace = useRef(1);
  const world = useRef(initial());
  const run = useRef<string | undefined>(undefined);
  const isAdmin = user?.role === 'admin';
  const localQ = useRef<{ options: string[]; right: number; topic: number | null } | undefined>(undefined);
  const track = useRef<HTMLButtonElement>(null);
  const quizDialog = useRef<HTMLDialogElement>(null);
  const quizFeedback = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const dialog = quizDialog.current;
    if (phase === 'quiz' && dialog && !dialog.open) dialog.showModal();
    if (phase !== 'quiz' && dialog?.open) dialog.close();
  }, [phase]);
  useEffect(() => { if (quizResult) quizFeedback.current?.focus(); }, [quizResult]);

  const refreshRank = useCallback(async () => {
    if (!user || user.role === 'admin') return;
    const { data } = await runner('rank');
    if (data?.status === 'ok') setRank(data.players);
  }, [user]);

  useEffect(() => { void refreshRank(); }, [refreshRank]);

  const finish = useCallback(() => {
    setPhase('over');
    if (run.current && user?.role !== 'admin') void runner('finish', run.current);
    if (user && !user.external) saveGameRecord(user.id, { game: 'runner', score: world.current.score, total: 0 });
    void refreshRank();
  }, [refreshRank, user]);

  const checkpoint = useCallback(async () => {
    setPhase('loading');
    if (user?.role === 'admin') {
      const bank = await loadAdminBank();
      if (!bank?.length) { setMessage('Marradagi savolni yuklab bo‘lmadi.'); finish(); return; }
      const item = bank[Math.floor(Math.random() * bank.length)];
      const order = item.options.map((_, i) => i).sort(() => Math.random() - .5);
      localQ.current = { options: order.map(i => item.options[i]), right: order.indexOf(item.correct_index), topic: item.topic };
      setQuiz({ question: item.question, options: localQ.current.options });
      setQuizResult(undefined);
      setPhase('quiz');
      return;
    }
    const { data, error } = await runner('question', run.current);
    if (error || data?.status !== 'ok') {
      setMessage('Marradagi savolni yuklab bo‘lmadi.');
      finish();
      return;
    }
    setQuiz(data);
    setQuizResult(undefined);
    setPhase('quiz');
  }, [finish, user?.role]);

  useEffect(() => {
    if (phase !== 'running') return;
    track.current?.focus({ preventScroll: true });
    let handle = 0;
    let last = 0;
    function tick(time: number) {
      const dt = last ? Math.min((time - last) / 1000, 0.035) : 0;
      last = time;
      const w = world.current;
      w.x -= (205 + Math.min(w.score * 2, 65)) * 1.2 * pace.current * dt;
      w.y = Math.max(0, w.y + w.velocity * dt);
      w.velocity = w.y > 0 ? w.velocity - 920 * dt : 0;
      setFrame({ ...w });
      const end = w.x + (w.heights.length - 1) * 31 + 23;
      if (w.heights.some((height, i) => {
        const obstacle = w.x + i * 31;
        return obstacle < 101 && obstacle + 23 > 72 && w.y < height;
      }) && time > immune.current) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) { finish(); return; }
        immune.current = time + 1500;
      }
      if (!w.counted && end <= 72) {
        w.counted = true;
        w.score += 1;
        setScore(w.score);
        if (w.score % 3 === 0) setPep(encouragement[(w.score / 3) % encouragement.length]);
        if (w.score % 5 === 0) { void checkpoint(); return; }
      }
      if (end < 0) {
        w.x = 500 + Math.random() * 100;
        w.heights = Array.from({ length: Math.random() < .26 ? 2 : 1 }, () => 22 + Math.floor(Math.random() * 23));
        w.counted = false;
      }
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
    if (isAdmin) {
      setBusy(false);
      run.current = undefined;
      livesRef.current = MAX_LIVES;
      immune.current = 0;
      setLives(MAX_LIVES);
      world.current = initial();
      setFrame(world.current);
      setScore(0);
      setPep(encouragement[0]);
      setMissedTopic(undefined);
      setMessage('Administrator rejimi: natija reytingga yozilmaydi, savollar butun test bankidan olinadi.');
      setPhase('running');
      return;
    }
    const { data, error } = await runner('start');
    setBusy(false);
    if (error || data?.status !== 'ok') {
      setMessage(data?.status === 'ineligible' ? 'Reytingli o‘yin Soliq oliy maktabi talabalari uchun.' : 'O‘yinni boshlashda xatolik yuz berdi.');
      return;
    }
    run.current = data.id;
    livesRef.current = MAX_LIVES;
    immune.current = 0;
    setLives(MAX_LIVES);
    world.current = initial();
    setFrame(world.current);
    setScore(0);
    setPep(encouragement[0]);
    setMissedTopic(undefined);
    setPhase('running');
  }

  async function answer(choice: number) {
    if (busy || phase !== 'quiz' || quizResult) return;
    setBusy(true);
    const { data } = isAdmin
      ? { data: { status: choice === localQ.current?.right ? 'correct' : 'wrong', topic: localQ.current?.topic } }
      : await runner('answer', run.current, choice);
    setBusy(false);
    if (data?.status === 'correct') {
      setQuizResult('correct');
      void refreshRank();
    } else {
      setMissedTopic(data?.topic);
      setQuizResult(data?.status === 'wrong' ? 'wrong' : 'error');
    }
  }

  function afterQuiz() {
    if (quizResult === 'correct') {
      world.current.x = 520;
      world.current.y = 0;
      world.current.velocity = 0;
      world.current.counted = false;
      setFrame({ ...world.current });
      setQuiz(undefined);
      setPhase('running');
    } else if (quizResult) {
      finish();
    }
  }

  const topic = catalogService.getTopics().data.find(t => t.globalOrder === missedTopic);

  return <div className="container page runner-page">
    <PageHeader title="Marraga yugurish" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Marraga yugurish' }]}
      description="To‘siqlardan uchib o‘ting: 3 marta urilishga ruxsat bor. Har 5 ballik marrada bitta savolga javob bering (xato javob raundni tugatadi)." />
    <div className="stack">
      <Card title={score + ' ball · jon: ' + '❤'.repeat(lives) + '🖤'.repeat(MAX_LIVES - lives)}>
        <div className="runner-controls">
          <div role="group" aria-label="O‘yin tezligi" className="presentation-actions">
            {[1, 2, 3].map(value => <button key={value} type="button"
              className={speed === value ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm'}
              aria-pressed={speed === value} onClick={() => {
                pace.current = value;
                setSpeed(value);
                if (phase === 'running') track.current?.focus();
              }}>{value}×</button>)}
          </div>
          <strong aria-live="polite">{pep}</strong>
        </div>
        <button ref={track} type="button" className="runner-track" aria-label="Ko‘tarilish" onClick={jump} onKeyDown={event => {
          if (event.key === 'ArrowUp') { event.preventDefault(); jump(); }
        }}>
          <svg viewBox="0 0 590 190" preserveAspectRatio="xMidYMax meet" width="100%" aria-hidden="true">
            <defs>
              <linearGradient id="rn-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc8ff" /><stop offset="1" stopColor="#e9f7ff" /></linearGradient>
              <linearGradient id="rn-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9a066" /><stop offset="1" stopColor="#a8683a" /></linearGradient>
              <linearGradient id="rn-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#b9c9d6" /></linearGradient>
              <radialGradient id="rn-glass" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#bfe8ff" /><stop offset="1" stopColor="#2b7fc4" /></radialGradient>
              <linearGradient id="rn-fire" x1="1" x2="0"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#ff6a3d" /></linearGradient>
              <linearGradient id="rn-bar" x1="0" x2="1"><stop offset="0" stopColor="#b97a49" /><stop offset="1" stopColor="#7a4626" /></linearGradient>
            </defs>
            <rect width="590" height="190" fill="url(#rn-sky)" />
            <circle className="rn-sun" cx="500" cy="42" r="24" fill="#ffe08a" />
            <g className="rn-cloud rn-cloud--a"><ellipse cx="120" cy="38" rx="34" ry="10" fill="#fff" /><ellipse cx="140" cy="30" rx="20" ry="10" fill="#fff" /></g>
            <g className="rn-cloud rn-cloud--b"><ellipse cx="330" cy="58" rx="28" ry="8" fill="#fff" opacity=".9" /><ellipse cx="346" cy="51" rx="16" ry="8" fill="#fff" opacity=".9" /></g>
            <path d="M0 120 Q70 70 150 118 T300 112 T450 116 T610 108 V190H0Z" fill="#a8d5ab" />
            <path d="M0 138 Q90 100 190 136 T380 132 T610 134 V190H0Z" fill="#6fb376" />
            <rect y="157" width="590" height="33" fill="url(#rn-ground)" />
            <rect y="157" width="590" height="5" fill="#ecb47b" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} className="rn-lane" x={i * 80} y="176" width="40" height="3" rx="1.5" fill="#fff" opacity=".75" />)}
            {frame.heights.map((height, i) => (
              <g key={i}>
                <ellipse cx={frame.x + i * 31 + 11} cy="158" rx="15" ry="3" fill="#000" opacity=".2" />
                <rect x={frame.x + i * 31} y={157 - height} width="23" height={height} rx="4" fill="url(#rn-bar)" />
                <rect x={frame.x + i * 31} y={157 - height} width="23" height="6" rx="3" fill="#fff" opacity=".85" />
              </g>
            ))}
            <ellipse cx="86" cy="158" rx={16 - Math.min(frame.y / 6, 8)} ry="3.5" fill="#000" opacity=".22" />
            <g transform={'translate(0 ' + (7 - frame.y) + ')'}>
              <g className="rn-ship">
                <path className={'rn-flame' + (frame.y > 0 ? ' rn-flame--boost' : '')} d="M73 134 L56 130 L62 134 L56 138Z" fill="url(#rn-fire)" />
                <path d="M73 130 L64 120 L79 127Z" fill="#2f4d6b" />
                <path d="M72 134 Q72 126 86 124 L102 128 Q108 133 102 138 Q96 144 86 144 Q72 142 72 134Z" fill="url(#rn-hull)" stroke="#9fb4c4" strokeWidth=".8" />
                <path d="M74 134 L104 134" stroke="#27a68f" strokeWidth="2" strokeLinecap="round" />
                <path d="M80 139 L72 150 L91 144Z" fill="#2f4d6b" />
                <ellipse cx="92" cy="130" rx="6.5" ry="4.6" fill="url(#rn-glass)" />
                <ellipse cx="90" cy="128.6" rx="2.2" ry="1.2" fill="#fff" opacity=".8" />
              </g>
            </g>
          </svg>
        </button>
        <div className="stack mt-3">
          {!user && <Button to={paths.login}>O‘ynash uchun kiring</Button>}
          {user && (phase === 'ready' || phase === 'over') && <Button disabled={busy} onClick={() => void start()}>{phase === 'over' ? 'Qayta o‘ynash' : 'Boshlash'}</Button>}
          {phase === 'running' && <p className="small muted"><span className="hint-touch">Ko‘tarilish uchun o‘yin maydoniga bosing.</span><span className="hint-key">Ko‘tarilish uchun maydonni bosing yoki ↑ tugmasidan foydalaning.</span></p>}
          {phase === 'loading' && <p role="status">Savol yuklanmoqda…</p>}
          {phase === 'over' && <strong>Raund natijasi: {score} ball</strong>}
          {message && <p role="status">{message}</p>}
          {topic && <Button variant="secondary" to={paths.topic(topic.id)}>{topic.title}</Button>}
        </div>
      </Card>
      <GameTopThree players={user ? rank : undefined} signedIn={Boolean(user)}
        description="To‘g‘ri javob bilan tasdiqlangan eng yuqori marra hisoblanadi." />
    </div>
    <dialog ref={quizDialog} className="target-dialog" aria-labelledby="runner-quiz-heading" onCancel={event => event.preventDefault()}>
      {quiz && <div className="stack">
        <h2 id="runner-quiz-heading">Marra savoli</h2>
        <strong>{quiz.question}</strong>
        {!quizResult ? quiz.options.map((option, i) => (
          <button key={i} type="button" className="test-option" disabled={busy} onClick={() => void answer(i)}>{option}</button>
        )) : <>
          <p ref={quizFeedback} tabIndex={-1} role="status" className={`target-feedback ${quizResult === 'correct' ? 'is-correct' : 'is-wrong'}`}>
            {quizResult === 'correct' ? 'To‘g‘ri! Marra tasdiqlandi.' : quizResult === 'wrong' ? 'Javob xato. Raund tugadi.' : 'Javobni tekshirib bo‘lmadi.'}
          </p>
          <Button onClick={afterQuiz}>{quizResult === 'correct' ? 'Davom etish' : 'Natijani ko‘rish'}</Button>
        </>}
      </div>}
    </dialog>
  </div>;
}
