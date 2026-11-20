import { useEffect, useRef, useState } from 'react';
import { Target } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { topicGameBank } from '@/data/topicGames';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';
import { GameTopThree, type RankedPlayer } from './GameTopThree';
import { useRecordGame } from './recordGame';
import { saveGameRecord } from '@/modules/student/gameStats';

function bonusQuestion(maxTopic: number) {
  const topic = Math.floor(Math.random() * Math.min(maxTopic, topicGameBank.length)) + 1;
  const bank = topicGameBank[topic - 1];
  const answer = Math.floor(Math.random() * bank.length);
  const options = bank.map(([label], index) => ({ label, correct: index === answer }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  const rewardRoll = Math.random();
  const reward = rewardRoll < 0.05 ? 5 : rewardRoll < 0.30 ? 3 : 2;
  return { prompt: bank[answer][1], options, reward, answer: bank[answer][0], topic };
}

export function TargetGamePage() {
  const record = useRecordGame();
  const { user } = useAuth();
  const [rank, setRank] = useState<RankedPlayer[]>();
  const [rankError, setRankError] = useState('');
  const roundId = useRef<string | undefined>(undefined);
  const savedRound = useRef<string | undefined>(undefined);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'question' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState(10);
  const [shots, setShots] = useState(0);
  const [position, setPosition] = useState(20);
  const [note, setNote] = useState('');
  const [question, setQuestion] = useState<ReturnType<typeof bonusQuestion>>();
  const [questionError, setQuestionError] = useState(false);
  const [feedback, setFeedback] = useState<boolean>();
  const [impact, setImpact] = useState<{ offset: number; points: number }>();
  const current = useRef(20);
  const motion = useRef(0);
  const field = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const feedbackPanel = useRef<HTMLParagraphElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const speed = 0.9 * 1.01 ** shots;

  useEffect(() => {
    if (!user) return;
    let current = true;
    async function loadResults() {
      setRankError('');
      if (phase === 'over' && roundId.current && user && !user.external) {
        if (savedRound.current !== roundId.current) {
          savedRound.current = roundId.current;
          saveGameRecord(user.id, { game: 'target', score, total: shots });
        }
      }
      if (phase === 'over' && roundId.current && user?.role === 'student' && !user.external) {
        const { error } = await supabase.rpc('econ_finish_target', {
          round_id: roundId.current, round_points: score, round_shots: shots,
        });
        if (current && error) setRankError('Raund natijasini saqlab bo‘lmadi.');
      }
      const { data, error } = await supabase.rpc('econ_target_rank');
      if (!current) return;
      if (error) setRankError('Reytingni yuklab bo‘lmadi.');
      else setRank(data);
    }
    // During play, the current score stays local until the round ends.
    if (phase === 'ready' || phase === 'over') void loadResults();
    return () => { current = false; };
  }, [user, phase, score, shots]);

  useEffect(() => {
    const dialog = modal.current;
    if (phase === 'question' && dialog && !dialog.open) dialog.showModal();
    if (phase !== 'question' && dialog?.open) dialog.close();
    if (phase === 'playing') trigger.current?.focus({ preventScroll: true });
  }, [phase]);
  useEffect(() => { if (feedback !== undefined) feedbackPanel.current?.focus(); }, [feedback]);

  useEffect(() => {
    if (phase !== 'playing') return;
    let previous: number | undefined;
    let handle: number;
    function tick(time: number) {
      if (previous !== undefined) motion.current += Math.min(time - previous, 60) * speed;
      previous = time;
      current.current = 50 + 39 * Math.sin(motion.current / 470);
      setPosition(current.current);
      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [phase, speed]);

  function start() {
    roundId.current = crypto.randomUUID();
    setScore(0); setArrows(10); setShots(0); setNote(''); setQuestion(undefined); setFeedback(undefined); setImpact(undefined);
    motion.current = -650;
    setPhase('playing');
  }

  async function loadBonusQuestion() {
    setQuestionError(false);
    const { data, error } = await supabase.rpc('econ_game_topic_limit');
    if (error || !Number.isInteger(data) || data < 1) {
      setQuestionError(true);
      return;
    }
    setQuestion(bonusQuestion(data));
  }

  function shoot() {
    if (phase !== 'playing' || arrows <= 0) return;
    const offset = 50 - current.current;
    const fieldWidth = field.current?.clientWidth ?? 0;
    const radius = (disc.current?.offsetWidth ?? 0) / 2;
    const distance = radius > 0 ? Math.abs(offset) * fieldWidth / (100 * radius) : Infinity;
    const points = distance <= 0.3 ? 10 : distance <= 0.65 ? 5 : distance <= 1 ? 2 : 0;
    const remaining = arrows - 1 + Number(points > 0);
    setScore(value => value + points);
    setArrows(remaining);
    setShots(shots + 1);
    setImpact({ offset, points });
    setNote(points ? '+' + points + ' ball · 1 ta o‘q qaytarildi.' : 'Nishonga tegmadi.');
    if ((shots + 1) % 10 === 0) {
      setPhase('question');
      void loadBonusQuestion();
    } else if (!remaining) setPhase('over');
  }

  function answer(correct: boolean) {
    if (phase !== 'question' || !question || feedback !== undefined) return;
    setFeedback(correct);
    record('target-answer', question.topic, [{ question: question.prompt, correct }]);
    if (correct) setArrows(value => value + question.reward);
  }

  function continueRound() {
    if (feedback === undefined) return;
    setQuestion(undefined);
    setFeedback(undefined);
    setPhase(arrows > 0 ? 'playing' : 'over');
  }

  return <div className="container page runner-page">
    <PageHeader title="Mergan" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Mergan' }]}
      description="Nishon markaz chizig‘iga yaqinlashganda tugmani bosing. Har o‘ninchi otishda bonus savol chiqadi." />
    <div className="stack">
      <Card>
        <div className="target-hud"><strong>{score} ball</strong><strong>{arrows} ta o‘q</strong><strong>{shots} ta urinish</strong>
          <strong>Tezlik {Math.round(speed * 100)}%</strong></div>
        <div className="target-ammo" aria-hidden="true">{Array.from({ length: arrows }, (_, index) => <i key={index} />)}</div>
        <div ref={field} className="target-field" aria-label="Harakatlanuvchi nishon maydoni">
          <div className="target-marker" aria-hidden="true" />
          <div ref={disc} className="target-disc" style={{ left: position + '%' }} aria-hidden="true"><span /></div>
          <svg className="target-launcher" viewBox="0 0 48 75" aria-hidden="true">
            <path d="M18 6h12v24h7v16H28l-3 24H13l2-26h-5V30h8Z" fill="#265948" />
            <path d="M18 6h12v6H18Z" fill="#e6a84d" />
            <path d="M16 33h15v7H16Z" fill="#76b59d" />
          </svg>
          {impact && <div className={`target-impact${impact.points ? ' is-hit' : ''}`} key={shots} aria-hidden="true"
            style={{ left: (impact.points ? position + impact.offset : 50) + '%' }}>
            <Target size={20} /><b>{impact.points ? '+' + impact.points : '×'}</b>
          </div>}
          {impact && <div className="target-shot" key={'shot-' + shots} aria-hidden="true" />}
        </div>
        <div className="stack mt-3">
          {(phase === 'ready' || phase === 'over') && <Button onClick={start}>{phase === 'ready' ? 'Boshlash' : 'Qayta o‘ynash'}</Button>}
          {phase === 'playing' && <button ref={trigger} type="button" className="btn btn--primary target-trigger" onClick={shoot}>Otish</button>}
          {note && <p role="status">{note}</p>}
        </div>
      </Card>
      <Card title={phase === 'over' ? 'Yakuniy natija' : 'O‘yin qoidalari'}>
        {phase === 'over' ? <strong>{score} ball · {shots} ta urinish</strong> : (
          <ul className="dots"><li>Boshlanishida 10 ta o‘q.</li><li>Nishonga tegsa, 10, 5 yoki 2 ball va 1 ta o‘q beriladi.</li>
            <li>Har 10 otishda bonus savol. Mukofot 2 yoki 3 ta o‘q, kamdan-kam 5 ta.</li>
            <li>Har otishdan keyin nishon 1% tezlashadi.</li></ul>
        )}
      </Card>
      {rankError && <p role="status">{rankError}</p>}
      <GameTopThree players={user ? rank : undefined} signedIn={Boolean(user)}
        description="Har bir talabaning yakunlangan raundlardagi eng yuqori bali." />
    </div>
    <dialog ref={modal} className="target-dialog" aria-labelledby="target-quiz-title" onCancel={event => event.preventDefault()}>
      <div className="stack">
        <h2 id="target-quiz-title">Bonus savol</h2>
        {!question && (questionError ? <>
          <p role="alert">Savol mavzulari chegarasini yuklab bo‘lmadi.</p>
          <Button onClick={() => void loadBonusQuestion()}>Qayta urinish</Button>
        </> : <p role="status">Savol yuklanmoqda…</p>)}
        {question && <>
        <strong>To‘g‘ri javob uchun {question.reward} ta o‘q</strong>
        <p>{question.prompt}</p>
        {feedback === undefined ? question.options.map((option, index) => (
          <button key={index} type="button" className="test-option" onClick={() => answer(option.correct)}>{option.label}</button>
        )) : <>
          <p ref={feedbackPanel} tabIndex={-1} className={`target-feedback ${feedback ? 'is-correct' : 'is-wrong'}`} role="status">
            {feedback ? `To‘g‘ri! ${question.reward} ta o‘q qo‘shildi.` : `Xato. To‘g‘ri javob: ${question.answer}.`}
          </p>
          <Button onClick={continueRound}>{arrows > 0 ? 'Davom etish' : 'Natijani ko‘rish'}</Button>
        </>}
        </>}
      </div>
    </dialog>
  </div>;
}
