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
      if (phase === 'over' && roundId.current && user?.role === 'student' && !user.external) {
        if (savedRound.current !== roundId.current) {
          savedRound.current = roundId.current;
          saveGameRecord(user.id, { game: 'target', score, total: shots });
        }
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

const scenarios = [
  { prompt: 'Daromad oshdi. Mahsulot odatiy tovar. Grafikda o‘zgarishni ko‘rsating.', values: [1, 0, 0], reason: 'Odatiy tovarga talab oshadi. Muvozanat narxi va miqdori ortadi.' },
  { prompt: 'Ishlab chiqarish xarajati oshdi. Taklif egri chizig‘ini moslang.', values: [0, -1, 0], reason: 'Taklif kamayadi. Muvozanat narxi ko‘tariladi, miqdor kamayadi.' },
  { prompt: 'Texnologiya ishlab chiqarishni arzonlashtirdi. Grafikni moslang.', values: [0, 1, 0], reason: 'Taklif ortadi. Narx pasayadi, miqdor esa ortadi.' },
  { prompt: 'Xaridorlarning shu tovarga qiziqishi pasaydi. Grafikni moslang.', values: [-1, 0, 0], reason: 'Talab kamayadi. Muvozanat narxi va miqdori pasayadi.' },
  { prompt: 'Bozorda tanqislik yuzaga keladigan narxni tanlang. Egri chiziqlar o‘rnida qolsin.', values: [0, 0, -1], reason: 'Muvozanatdan past narxda talab miqdori taklif miqdoridan katta bo‘ladi.' },
  { prompt: 'Bozorda ortiqcha taklif yuzaga keladigan narxni tanlang. Egri chiziqlar o‘rnida qolsin.', values: [0, 0, 1], reason: 'Muvozanatdan yuqori narxda taklif miqdori talab miqdoridan katta bo‘ladi.' },
  { prompt: 'Xaridorlar soni ortdi va ishlab chiqarish ham kengaydi. Grafikni moslang.', values: [1, 1, 0], reason: 'Har ikki chiziq o‘ngga siljiydi. Bu modelda siljishlar bir xil kattalikda, shuning uchun narx o‘zgarmaydi.' },
  { prompt: 'Bozor narxida talab va taklif teng bo‘lishi kerak. Narxni muvozanatga qaytaring.', values: [0, 0, 0], reason: 'Muvozanat narxida talab va taklif miqdorlari teng.' },
];

export function GraphGamePage() {
  const record = useRecordGame();
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState([0, 0, 0]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const scenario = scenarios[index];
  const correct = scenario?.values.every((value, i) => value === values[i]);
  const [d, s, market] = values;
  const demand = 95 + d * 14;
  const supply = 25 - s * 14;
  const equilibriumQuantity = (demand - supply) / 2;
  const equilibriumPrice = demand - equilibriumQuantity;
  const tradePrice = equilibriumPrice + market * 10;
  const x = (q: number) => 42 + q * 4.2;
  const y = (p: number) => 205 - p * 1.55;

  function next() {
    setIndex(index + 1); setChecked(false); setValues(index === scenarios.length - 2 ? [0, 0, -1] : [0, 0, 0]);
  }

  return <div className="container page">
    <PageHeader title="Grafikni boshqar" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Grafikni boshqar' }]}
      description="Talab, taklif va bozor narxini o‘zgartirib, vaziyatga mos grafik tuzing." />
    {!scenario ? <Card title="Natija"><div className="stack"><strong>{score} / {scenarios.length} ta to‘g‘ri</strong>
      <Button onClick={() => { setIndex(0); setValues([0, 0, 0]); setChecked(false); setScore(0); }}>Qayta o‘ynash</Button></div></Card> :
      <div className="grid grid--2-1">
        <Card title="Bozor grafigi">
          <svg viewBox="0 0 360 245" width="100%" role="img" aria-label="Talab, taklif va muvozanat grafigi">
            <path d="M42 20V205H347" fill="none" stroke="#50675d" />
            <text x="8" y="22" fontSize="12">Narx</text><text x="344" y="226" textAnchor="end" fontSize="12">Miqdor</text>
            <line x1={x(0)} x2={x(70)} y1={y(demand)} y2={y(demand - 70)} stroke="#236753" strokeWidth="3" />
            <line x1={x(0)} x2={x(70)} y1={y(supply)} y2={y(supply + 70)} stroke="#a35429" strokeWidth="3" />
            <line x1={x(0)} x2={x(70)} y1={y(tradePrice)} y2={y(tradePrice)} stroke="#47508a" strokeDasharray="5 4" />
            <circle cx={x(equilibriumQuantity)} cy={y(equilibriumPrice)} r="5" fill="#173c32" />
          </svg>
          <p className="small"><strong style={{ color:'#236753' }}>Talab</strong> · <strong style={{ color:'#a35429' }}>Taklif</strong> · <strong style={{ color:'#47508a' }}>Bozor narxi</strong></p>
          <p>Muvozanat: narx {equilibriumPrice}, miqdor {equilibriumQuantity}. Tanlangan narx: {tradePrice}.</p>
        </Card>
        <Card title={`${index + 1} / ${scenarios.length} · Topshiriq`}>
          <div className="stack">
            <strong>{scenario.prompt}</strong>
            {['Talab', 'Taklif', 'Bozor narxi'].map((label, field) => <label key={label}>{label}
              <select className="search-control" value={values[field]} disabled={checked} onChange={event =>
                setValues(previous => previous.map((v, i) => i === field ? Number(event.target.value) : v))}>
                <option value={-1}>{field === 2 ? 'Muvozanatdan past' : 'Chapga'}</option>
                <option value={0}>{field === 2 ? 'Muvozanatda' : 'O‘z joyida'}</option>
                <option value={1}>{field === 2 ? 'Muvozanatdan yuqori' : 'O‘ngga'}</option>
              </select>
            </label>)}
            {!checked ? <Button onClick={() => { if (correct) setScore(value => value + 1); record('graph', 6, [{ question: scenario.prompt, correct: Boolean(correct) }]); setChecked(true); }}>Tekshirish</Button> : <>
              <p role="status"><strong>{correct ? 'To‘g‘ri.' : 'Xato.'}</strong> {scenario.reason}</p>
              <Button onClick={next}>{index === scenarios.length - 1 ? 'Natijani ko‘rish' : 'Keyingi topshiriq'}</Button>
            </>}
          </div>
        </Card>
      </div>}
  </div>;
}
