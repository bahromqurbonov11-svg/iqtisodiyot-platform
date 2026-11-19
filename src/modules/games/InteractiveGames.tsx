import { useEffect, useRef, useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { topicGameBank } from '@/data/topicGames';
import { paths } from '@/navigation/paths';

function bonusQuestion() {
  const bank = topicGameBank[Math.floor(Math.random() * topicGameBank.length)];
  const answer = Math.floor(Math.random() * bank.length);
  const options = bank.map(([label], index) => ({ label, correct: index === answer }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { prompt: bank[answer][1], options };
}

export function TargetGamePage() {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'question' | 'over'>('ready');
  const [score, setScore] = useState(0);
  const [arrows, setArrows] = useState(10);
  const [shots, setShots] = useState(0);
  const [position, setPosition] = useState(20);
  const [note, setNote] = useState('');
  const [question, setQuestion] = useState<ReturnType<typeof bonusQuestion>>();
  const current = useRef(20);
  const motion = useRef(0);

  useEffect(() => {
    if (phase !== 'playing') return;
    let previous: number | undefined;
    let handle: number;
    function tick(time: number) {
      if (previous !== undefined) motion.current += Math.min(time - previous, 60);
      previous = time;
      current.current = 50 + 39 * Math.sin(motion.current / 470);
      setPosition(current.current);
      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [phase]);

  function start() {
    setScore(0); setArrows(10); setShots(0); setNote(''); setQuestion(undefined);
    motion.current = -650;
    setPhase('playing');
  }

  function shoot() {
    if (phase !== 'playing' || arrows <= 0) return;
    const distance = Math.abs(current.current - 50);
    const points = distance <= 2 ? 10 : distance <= 5 ? 5 : distance <= 8 ? 2 : 0;
    const remaining = arrows - 1;
    setScore(value => value + points);
    setArrows(remaining);
    setShots(shots + 1);
    setNote(points ? '+' + points + ' ball' : 'Nishonga tegmadi.');
    if ((shots + 1) % 5 === 0) {
      setQuestion(bonusQuestion());
      setPhase('question');
    } else if (!remaining) setPhase('over');
  }

  function answer(correct: boolean) {
    if (phase !== 'question') return;
    if (correct) setArrows(value => value + 2);
    setNote(correct ? 'To‘g‘ri javob. 2 ta bonus o‘q!' : 'Xato javob. Bonus o‘q berilmadi.');
    setQuestion(undefined);
    setPhase(correct || arrows > 0 ? 'playing' : 'over');
  }

  return <div className="container page">
    <PageHeader title="Mergan" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Mergan' }]}
      description="Nishon markaz chizig‘iga yaqinlashganda tugmani bosing. Har beshinchi urinishda bonus savol chiqadi." />
    <div className="grid grid--2-1">
      <Card>
        <div className="target-hud"><strong>{score} ball</strong><strong>{arrows} ta o‘q</strong><strong>{shots} ta urinish</strong></div>
        <div className="target-field" aria-label="Harakatlanuvchi nishon maydoni">
          <div className="target-marker" aria-hidden="true" />
          <div className="target-disc" style={{ left: position + '%' }} aria-hidden="true"><span /></div>
        </div>
        <div className="stack mt-3">
          {(phase === 'ready' || phase === 'over') && <Button onClick={start}>{phase === 'ready' ? 'Boshlash' : 'Qayta o‘ynash'}</Button>}
          {phase === 'playing' && <Button onClick={shoot}>Otish</Button>}
          {note && <p role="status">{note}</p>}
        </div>
      </Card>
      <Card title={phase === 'question' ? 'Bonus savol' : phase === 'over' ? 'Yakuniy natija' : 'O‘yin qoidalari'}>
        {phase === 'question' && question ? <div className="stack">
          <strong>{question.prompt}</strong>
          {question.options.map((option, index) => <button key={index} type="button" className="test-option"
            onClick={() => answer(option.correct)}>{option.label}</button>)}
        </div> : phase === 'over' ? <strong>{score} ball · {shots} ta urinish</strong> : (
          <ul className="dots"><li>Boshlanishida 10 ta o‘q.</li><li>Markazga yaqinlikka qarab 10, 5 yoki 2 ball.</li>
            <li>Har 5 urinishda savol. To‘g‘ri javob uchun 2 ta o‘q.</li></ul>
        )}
      </Card>
    </div>
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
            {!checked ? <Button onClick={() => { if (correct) setScore(value => value + 1); setChecked(true); }}>Tekshirish</Button> : <>
              <p role="status"><strong>{correct ? 'To‘g‘ri.' : 'Xato.'}</strong> {scenario.reason}</p>
              <Button onClick={next}>{index === scenarios.length - 1 ? 'Natijani ko‘rish' : 'Keyingi topshiriq'}</Button>
            </>}
          </div>
        </Card>
      </div>}
  </div>;
}
