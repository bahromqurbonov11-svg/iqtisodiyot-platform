import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Crown, Flame, Heart, Timer, Trophy } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';
import { saveGameRecord } from '@/modules/student/gameStats';
import { useRecordGame } from './recordGame';
import { pickQuestions, type GraphQuestion } from './graph/questions';

const ROUND = 10;
const SECONDS = 45;
const STEP = 12;

/* Model: talab P = D - Q, taklif P = S + Q. Boshlang‘ich D = 95, S = 25 (muvozanat: P = 60, Q = 35). */
const BASE_D = 95;
const BASE_S = 25;
const X0 = 60;
const Y0 = 290;
const SX = 4.4;
const SY = 2;
const x = (q: number) => X0 + q * SX;
const y = (p: number) => Y0 - p * SY;
const tr = (px: number, py: number, sx = 1, sy = 1): CSSProperties => ({ transform: 'translate(' + px + 'px,' + py + 'px) scale(' + sx + ',' + sy + ')' });

const demandLabels = ['Keskin chapga', 'Biroz chapga', 'O‘z joyida', 'Biroz o‘ngga', 'Keskin o‘ngga'];
const demandShort = ['◀◀', '◀', '●', '▶', '▶▶'];
const priceLabels = ['Muvozanatdan past', 'Muvozanatda', 'Muvozanatdan yuqori'];

function Segmented({ label, value, onChange, options, short, disabled }: {
  label: string; value: number; onChange: (v: number) => void; options: string[]; short?: string[]; disabled?: boolean;
}) {
  const offset = Math.floor(options.length / 2);
  return (
    <div className="gg-field">
      <span className="gg-field__label">{label}</span>
      <div className="gg-seg" role="radiogroup" aria-label={label}>
        {options.map((text, i) => {
          const v = i - offset;
          return (
            <button key={text} type="button" role="radio" aria-checked={value === v} aria-label={text} title={text} disabled={disabled}
              className={'gg-seg__btn' + (value === v ? ' is-on' : '')} onClick={() => onChange(v)}>
              {short ? short[i] : text}
            </button>
          );
        })}
      </div>
      <span className="gg-field__hint">{options[value + offset]}</span>
    </div>
  );
}

function Chart({ values }: { values: number[] }) {
  const [d, s, p] = values;
  const dem = BASE_D + d * STEP;
  const sup = BASE_S - s * STEP;
  const q = (dem - sup) / 2;
  const eq = (dem + sup) / 2;
  const price = eq + p * STEP;
  const qd = dem - price;
  const qs = price - sup;
  const gap = Math.abs(qd - qs);
  const kind = gap < 0.5 ? '' : qd > qs ? 'short' : 'surplus';
  const dq = Math.min(dem - 18, 96);
  const sq = Math.min(125 - sup, 96);
  const ease = 'transform .7s cubic-bezier(.2,.8,.2,1)';
  const motion: CSSProperties = { transition: ease, transformOrigin: '0 0' };
  return (
    <svg viewBox="0 0 520 330" width="100%" role="img" aria-label="Talab, taklif va bozor narxi grafigi" className="gg-chart">
      <defs>
        <clipPath id="gg-clip"><rect x={X0} y={24} width={450} height={Y0 - 24} /></clipPath>
        <linearGradient id="gg-grid" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e9f3ec" /><stop offset="1" stopColor="#fff" /></linearGradient>
      </defs>
      <rect x={X0} y={24} width={450} height={Y0 - 24} fill="url(#gg-grid)" rx="6" />
      {[1, 2, 3, 4].map(i => <line key={'h' + i} x1={X0} x2={X0 + 450} y1={y(i * 32)} y2={y(i * 32)} stroke="#dbe6de" strokeWidth="1" />)}
      {[1, 2, 3, 4].map(i => <line key={'v' + i} y1={24} y2={Y0} x1={x(i * 20)} x2={x(i * 20)} stroke="#dbe6de" strokeWidth="1" />)}
      <path d={'M' + X0 + ' 18V' + Y0 + 'H508'} fill="none" stroke="#50675d" strokeWidth="1.6" />
      <text x="10" y="14" fontSize="14" fill="#243b33">Narx (P)</text>
      <text x="508" y="318" textAnchor="end" fontSize="14" fill="#243b33">Miqdor (Q)</text>

      <g clipPath="url(#gg-clip)">
        <g style={{ ...motion, ...tr(STEP * d * SX, 0) }}>
          <line x1={x(-40)} y1={y(BASE_D + 40)} x2={x(110)} y2={y(BASE_D - 110)} stroke="#236753" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g style={{ ...motion, ...tr(STEP * s * SX, 0) }}>
          <line x1={x(-40)} y1={y(BASE_S - 40)} x2={x(110)} y2={y(BASE_S + 110)} stroke="#a35429" strokeWidth="4" strokeLinecap="round" />
        </g>
        <line x1={0} y1={0} x2={1} y2={0} stroke="#47508a" strokeWidth="2" strokeDasharray="7 5" vectorEffect="non-scaling-stroke" style={{ ...motion, ...tr(X0, y(price), 450, 1) }} />
        {kind && <line x1={0} y1={0} x2={1} y2={0} strokeWidth="10" strokeLinecap="butt" vectorEffect="non-scaling-stroke"
          className={'gg-gap gg-gap--' + kind} style={{ ...motion, ...tr(x(Math.min(qd, qs)), y(price), (Math.abs(qd - qs)) * SX, 1) }} />}
      </g>

      <line x1={0} y1={0} x2={1} y2={0} stroke="#50675d" strokeWidth="1.4" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" style={{ ...motion, ...tr(X0, y(eq), x(q) - X0, 1) }} />
      <line x1={0} y1={0} x2={0} y2={1} stroke="#50675d" strokeWidth="1.4" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" style={{ ...motion, ...tr(x(q), y(eq), 1, Y0 - y(eq)) }} />

      <circle cx={x(35)} cy={y(60)} r="6" fill="none" stroke="#8a9a92" strokeWidth="2" strokeDasharray="3 3" />
      <text x={x(35)} y={y(60) + 30} fontSize="11" fill="#7a8a82" textAnchor="middle">avvalgi muvozanat</text>

      <g style={{ ...motion, ...tr(x(q), y(eq)) }}>
        <circle r="13" fill="#2f855a" opacity=".18" className="gg-pulse" />
        <circle r="7" fill="#153a32" stroke="#fff" strokeWidth="2" />
      </g>
      <g style={{ ...motion, ...tr(x(dq) + 8, y(dem - dq) + 4) }}><text fontSize="16" fontWeight="700" fill="#236753">D</text></g>
      <g style={{ ...motion, ...tr(x(sq) + 8, y(sup + sq) + 4) }}><text fontSize="16" fontWeight="700" fill="#a35429">S</text></g>
      <g style={{ ...motion, ...tr(X0 + 6, y(price) - 8) }}><text fontSize="12" fontWeight="700" fill="#47508a">Bozor narxi</text></g>
      {kind && <g style={{ ...motion, ...tr(x(Math.max(qd, qs)) + 10, y(price) - 12) }}>
        <text fontSize="13" fontWeight="700" textAnchor="start" fill={kind === 'short' ? '#c0453a' : '#2b6cb0'}>{kind === 'short' ? 'Tanqislik' : 'Ortiqcha taklif'}</text>
      </g>}
    </svg>
  );
}

type Phase = 'intro' | 'play' | 'won' | 'lost';

export function GraphGamePage() {
  const { user } = useAuth();
  const recordGame = useRecordGame();
  const recordRef = useRef(recordGame);
  recordRef.current = recordGame;
  const record: typeof recordGame = (...args) => recordRef.current(...args);
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<GraphQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState([0, 0, 0]);
  const [right, setRight] = useState(false);
  const [left, setLeft] = useState(SECONDS);
  const deadline = useRef(0);
  const next = useRef<number | undefined>(undefined);
  const question = questions[index];
  const student = user?.role === 'student' && !user.external;

  useEffect(() => () => window.clearTimeout(next.current), []);

  function finish(ok: boolean, at: number) {
    const q = questions[at];
    record('graph', 6, [{ question: q.prompt, correct: ok }]);
    if (!ok) { setPhase('lost'); return; }
    if (at === ROUND - 1) {
      if (student && user) saveGameRecord(user.id, { game: 'graphwin', score: 1, total: 1 });
      setPhase('won');
      return;
    }
    setRight(true);
    next.current = window.setTimeout(() => {
      setRight(false); setValues([0, 0, 0]); setIndex(at + 1); deadline.current = Date.now() + SECONDS * 1000; setLeft(SECONDS);
    }, 1100);
  }

  const submit = () => {
    if (!question || right) return;
    finish(question.answer.every((v, i) => v === values[i]), index);
  };

  useEffect(() => {
    if (phase !== 'play' || right) return;
    const timer = window.setInterval(() => {
      const remain = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain === 0) { window.clearInterval(timer); setPhase('lost'); record('graph', 6, [{ question: questions[index].prompt, correct: false }]); }
    }, 250);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, right, index, questions]);

  function start() {
    window.clearTimeout(next.current);
    setQuestions(pickQuestions(ROUND)); setIndex(0); setValues([0, 0, 0]); setRight(false);
    deadline.current = Date.now() + SECONDS * 1000; setLeft(SECONDS); setPhase('play');
  }

  const confetti = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    left: (i * 29) % 100, delay: (i % 9) * 120, size: 6 + (i % 5) * 3, hue: (i * 47) % 360, dur: 1800 + (i % 7) * 260,
  })), []);

  return (
    <div className="container page">
      <PageHeader title="Grafikni boshqar" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Grafikni boshqar' }]}
        description="Talab, taklif va bozor narxini siljitib, vaziyatga mos grafik tuzing. Bitta xato — o‘yin tugaydi." />

      {phase === 'intro' && (
        <div className="gg-intro">
          <Card className="gg-hero">
            <div className="gg-hero__badge"><Crown size={40} aria-hidden /></div>
            <h2>Saytdagi eng qiyin topshiriq</h2>
            <p>30 ta murakkab savoldan tasodifiy 10 tasi beriladi. Har bir savolga {SECONDS} soniya. Birinchi xato yoki vaqt tugashi o‘yinni yakunlaydi, xatoning sababi ko‘rsatilmaydi.</p>
            <ul className="gg-rules">
              <li><Heart size={18} aria-hidden /> <span>Faqat bitta imkoniyat: xato qilsangiz, o‘yin tugaydi.</span></li>
              <li><Timer size={18} aria-hidden /> <span>Har bir savol uchun {SECONDS} soniya.</span></li>
              <li><Flame size={18} aria-hidden /> <span>“Biroz” — 1 qadam, “keskin” — 2 qadam siljish.</span></li>
              <li><Trophy size={18} aria-hidden /> <span>10 / 10 bo‘lsa — kabinetdagi “Nishonlarim” bo‘limiga <b>Afsonaviy</b> nishon “Grafik grossmeysteri” qo‘shiladi.</span></li>
            </ul>
            {!student && <p className="small muted">Nishon faqat ro‘yxatdan o‘tgan talabalarga beriladi. Mehmon sifatida mashq qilishingiz mumkin.</p>}
            <Button size="lg" onClick={start}>O‘yinni boshlash</Button>
          </Card>
        </div>
      )}

      {phase === 'play' && question && (
        <div className="gg-layout">
          <Card className="gg-board" title="Bozor grafigi">
            <Chart values={values} />
            <div className="gg-legend"><span className="gg-legend__d">Talab (D)</span><span className="gg-legend__s">Taklif (S)</span><span className="gg-legend__p">Bozor narxi</span></div>
          </Card>
          <Card className={'gg-panel' + (right ? ' is-right' : '')}>
            <div className="gg-top">
              <ol className="gg-pips" aria-label="Savollar">
                {questions.map((_, i) => <li key={i} className={i < index || (i === index && right) ? 'is-done' : i === index ? 'is-now' : ''} />)}
              </ol>
              <span className={'gg-timer' + (left <= 10 ? ' is-urgent' : '')}><Timer size={16} aria-hidden /> {left}s</span>
            </div>
            <div className="gg-bar" aria-hidden><i style={{ width: (100 * left / SECONDS) + '%' }} /></div>
            <p className="gg-qno">{index + 1} / {ROUND} · Topshiriq</p>
            <p className="gg-prompt" key={question.id}>{question.prompt}</p>
            <Segmented label="Talab (D)" value={values[0]} options={demandLabels} short={demandShort} disabled={right}
              onChange={v => setValues([v, values[1], values[2]])} />
            <Segmented label="Taklif (S)" value={values[1]} options={demandLabels} short={demandShort} disabled={right}
              onChange={v => setValues([values[0], v, values[2]])} />
            <Segmented label="Bozor narxi" value={values[2]} options={priceLabels} disabled={right}
              onChange={v => setValues([values[0], values[1], v])} />
            {right ? <p className="gg-ok" role="status">✓ To‘g‘ri! Keyingi savol…</p> : <Button size="lg" onClick={submit}>Javobni tekshirish</Button>}
          </Card>
        </div>
      )}

      {phase === 'lost' && (
        <Card className="gg-end gg-end--lost">
          <h2>O‘yin tugadi</h2>
          <p className="gg-end__score"><b>{index}</b> / {ROUND}</p>
          <p>{index + 1}-savolda xatoga yo‘l qo‘yildi yoki vaqt tugadi. Mavzuni qayta ko‘rib chiqing va yangi savollar bilan urinib ko‘ring.</p>
          <div className="presentation-actions"><Button onClick={start}>Qayta urinish</Button><Button variant="secondary" to={paths.games}>O‘yinlarga qaytish</Button></div>
        </Card>
      )}

      {phase === 'won' && (
        <Card className="gg-end gg-end--won">
          <div className="gg-confetti" aria-hidden>
            {confetti.map((c, i) => <i key={i} style={{ left: c.left + '%', width: c.size, height: c.size * 1.6, background: 'hsl(' + c.hue + ' 80% 55%)', animationDelay: c.delay + 'ms', animationDuration: c.dur + 'ms' }} />)}
          </div>
          <div className="gg-crown"><Crown size={54} aria-hidden /></div>
          <h2>Grafik grossmeysteri!</h2>
          <p className="gg-end__score"><b>10</b> / 10</p>
          <p>Siz eng qiyin topshiriqni xatosiz bajardingiz.</p>
          {student
            ? <p className="gg-reward">🏆 Afsonaviy nishon “Grafik grossmeysteri” kabinetdagi “Nishonlarim” bo‘limiga qo‘shildi.</p>
            : <p className="gg-reward">Nishon olish uchun talaba sifatida ro‘yxatdan o‘ting va o‘yinni qayta o‘ynang.</p>}
          <div className="presentation-actions"><Button onClick={start}>Yana o‘ynash</Button><Button variant="secondary" to={paths.games}>O‘yinlarga qaytish</Button></div>
        </Card>
      )}
    </div>
  );
}
