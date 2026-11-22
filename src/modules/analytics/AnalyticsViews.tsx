import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, BookOpen, ChevronDown, ClipboardCheck, FileText, Presentation, X } from 'lucide-react';
import { CountUp } from '@/components/motion/Motion';
import { mastery } from '@/modules/student/useOwnProgress';
import { paths } from '@/navigation/paths';

/**
 * ANALITIKA KO‘RINISHLARI (faqat ko‘rsatish; ma’lumot ota sahifadan keladi).
 * Barcha raqamlar haqiqiy natijalardan hisoblanadi. Natija bo‘lmagan mavzu "Ma’lumot yo‘q" deb ko‘rsatiladi
 * va hech qachon "0 bilim" deb hisoblanmaydi.
 */

export type TopicInfo = { id: string; globalOrder: number; title: string };
export type Stat = { total: number; correct: number };
type Tone = 'success' | 'warning' | 'danger' | 'none';

const TONE_LABEL: Record<Tone, string> = {
  success: 'O‘zlashtirilgan', warning: 'Mashq kerak', danger: 'Bo‘shliq', none: 'Ma’lumot yo‘q',
};

export function toneOf(stat?: Stat): Tone {
  if (!stat || stat.total === 0) return 'none';
  return mastery(stat.correct, stat.total).tone;
}
const pct = (s: Stat) => (s.total ? Math.round((100 * s.correct) / s.total) : 0);

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

/* ---------- Asosiy ko‘rsatkichlar ---------- */
export type Kpi = { label: string; value: number | null; suffix?: string; hint: string; tone: 'primary' | 'success' | 'warning' | 'danger' | 'info'; icon: ReactNode };

export function KpiTiles({ tiles }: { tiles: Kpi[] }) {
  return (
    <div className="kpis">
      {tiles.map((k) => (
        <div key={k.label} className={'kpi kpi--' + k.tone}>
          <span className="kpi__icon" aria-hidden>{k.icon}</span>
          <div>
            <div className="kpi__value">{k.value === null ? '—' : <CountUp to={k.value} duration={900} />}{k.suffix}</div>
            <div className="kpi__label">{k.label}</div>
            <div className="kpi__hint">{k.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 25 mavzu xaritasi ---------- */
export function TopicMap({ parts, stats, selected, onSelect }: {
  parts: { id: string; title: string; topics: TopicInfo[] }[];
  stats: Map<number, Stat>;
  selected?: number;
  onSelect: (n: number) => void;
}) {
  const [hover, setHover] = useState<TopicInfo>();
  const counts: Record<Tone, number> = { success: 0, warning: 0, danger: 0, none: 0 };
  parts.forEach((p) => p.topics.forEach((t) => { counts[toneOf(stats.get(t.globalOrder))]++; }));
  const focus = hover ?? parts.flatMap((p) => p.topics).find((t) => t.globalOrder === selected);
  const focusStat = focus ? stats.get(focus.globalOrder) : undefined;

  return (
    <div className="tmap">
      <div className="tmap__legend">
        {(['success', 'warning', 'danger', 'none'] as Tone[]).map((tone) => (
          <span key={tone} className={'tmap__key tmap__key--' + tone}><i />{TONE_LABEL[tone]} <b>{counts[tone]}</b></span>
        ))}
      </div>
      {parts.map((p) => (
        <div key={p.id} className="tmap__part">
          <div className="tmap__part-title">{p.title}</div>
          <div className="tmap__grid">
            {p.topics.map((t) => {
              const s = stats.get(t.globalOrder);
              const tone = toneOf(s);
              return (
                <button
                  key={t.id}
                  type="button"
                  className={'tmap__tile tmap__tile--' + tone + (selected === t.globalOrder ? ' is-selected' : '')}
                  style={{ ['--i' as string]: t.globalOrder }}
                  aria-pressed={selected === t.globalOrder}
                  aria-label={t.globalOrder + '-mavzu. ' + t.title + '. ' + (s && s.total ? pct(s) + '% to‘g‘ri, ' + s.total + ' ta javob' : 'Ma’lumot yo‘q')}
                  onClick={() => onSelect(t.globalOrder)}
                  onMouseEnter={() => setHover(t)}
                  onMouseLeave={() => setHover(undefined)}
                  onFocus={() => setHover(t)}
                  onBlur={() => setHover(undefined)}
                >
                  <span className="tmap__num">{t.globalOrder}</span>
                  <span className="tmap__pct">{s && s.total ? pct(s) + '%' : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="tmap__caption" aria-live="polite">
        {focus
          ? <><b>{focus.globalOrder}-mavzu.</b> {focus.title} {focusStat && focusStat.total
              ? <>· <b>{pct(focusStat)}%</b> to‘g‘ri ({focusStat.correct}/{focusStat.total}) · {TONE_LABEL[toneOf(focusStat)]}</>
              : <>· hali natija yo‘q</>}</>
          : 'Mavzu ustiga boring yoki tanlang: batafsil tahlil pastda ochiladi.'}
      </p>
    </div>
  );
}

/* ---------- Mavzular reytingi (tartiblanadigan) ---------- */
type Sort = 'gap' | 'wrong' | 'order';

export function TopicRanking({ topics, stats, selected, onSelect }: {
  topics: TopicInfo[]; stats: Map<number, Stat>; selected?: number; onSelect: (n: number) => void;
}) {
  const [sort, setSort] = useState<Sort>('gap');
  const mounted = useMounted();
  const rows = topics.flatMap((t) => { const s = stats.get(t.globalOrder); return s && s.total ? [{ t, s }] : []; });
  rows.sort((a, b) =>
    sort === 'order' ? a.t.globalOrder - b.t.globalOrder
    : sort === 'wrong' ? (b.s.total - b.s.correct) - (a.s.total - a.s.correct) || pct(a.s) - pct(b.s)
    : pct(a.s) - pct(b.s) || b.s.total - a.s.total);

  if (!rows.length) return <p className="muted">Bu tanlov uchun mavzu bo‘yicha natija yo‘q.</p>;
  return (
    <div>
      <div className="rank-legend" aria-hidden>
        <span className="rank-legend__item rank-legend__item--success">O‘zlashtirilgan</span>
        <span className="rank-legend__item rank-legend__item--warning">Mashq kerak</span>
        <span className="rank-legend__item rank-legend__item--danger">Bo‘shliq</span>
      </div>
      <div className="chips rank-sort" role="group" aria-label="Tartiblash">
        <ArrowUpDown size={14} aria-hidden />
        {([['gap', 'Bo‘shliq birinchi'], ['wrong', 'Xato ko‘p'], ['order', 'Mavzu raqami']] as [Sort, string][]).map(([v, label]) => (
          <button key={v} type="button" className={'chip' + (sort === v ? ' is-on' : '')} aria-pressed={sort === v} onClick={() => setSort(v)}>{label}</button>
        ))}
      </div>
      <ol className="rank">
        {rows.map(({ t, s }) => {
          const tone = toneOf(s);
          return (
            <li key={t.id}>
              <button type="button" className={'rank__row rank__row--' + tone + (selected === t.globalOrder ? ' is-selected' : '')}
                onClick={() => onSelect(t.globalOrder)} aria-pressed={selected === t.globalOrder}>
                <span className="rank__num">{t.globalOrder}</span>
                <span className="rank__body">
                  <span className="rank__title">{t.title}</span>
                  <span className="rank__track"><i style={{ width: mounted ? pct(s) + '%' : '0%' }} /></span>
                  <span className="rank__meta">{s.correct} / {s.total} to‘g‘ri · {s.total - s.correct} ta xato</span>
                </span>
                <span className="rank__pct">{pct(s)}%</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- Dinamika chizig‘i ---------- */
export type TrendPoint = { label: string; percent: number; detail: string };

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [at, setAt] = useState<number>(points.length - 1);
  useEffect(() => setAt(points.length - 1), [points.length]);
  if (!points.length) return <p className="muted">Dinamika uchun urinishlar yo‘q.</p>;
  const W = 420, H = 190, L = 34, R = 12, T = 14, B = 28;
  const x = (i: number) => (points.length === 1 ? (L + W - R) / 2 : L + ((W - L - R) * i) / (points.length - 1));
  const y = (p: number) => T + ((H - T - B) * (100 - p)) / 100;
  const line = points.map((p, i) => x(i) + ',' + y(p.percent)).join(' ');
  const area = x(0) + ',' + y(0) + ' ' + line + ' ' + x(points.length - 1) + ',' + y(0);
  const avg = Math.round(points.reduce((s, p) => s + p.percent, 0) / points.length);
  const cur = points[Math.min(at, points.length - 1)];
  return (
    <div className="trend">
      <svg viewBox={'0 0 ' + W + ' ' + H} role="img" aria-label={'So‘nggi ' + points.length + ' ta urinish natijasi, o‘rtacha ' + avg + '%'}>
        <defs>
          <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#276e59" stopOpacity=".25" /><stop offset="1" stopColor="#276e59" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} stroke="#e3e8df" />
            <text x={L - 6} y={y(g) + 4} fontSize="10" textAnchor="end" fill="#6f817a">{g}</text>
          </g>
        ))}
        <line x1={L} x2={W - R} y1={y(avg)} y2={y(avg)} stroke="#c9a646" strokeDasharray="5 4" />
        <text x={W - R} y={y(avg) - 5} fontSize="10" textAnchor="end" fill="#8a6d12">o‘rtacha {avg}%</text>
        <polygon points={area} fill="url(#trend-fill)" className="trend__area" />
        <polyline points={line} className="trend__line" pathLength={1} fill="none" stroke="#276e59" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.percent)} r={i === at ? 6 : 4} className={'trend__dot' + (i === at ? ' is-on' : '')}
              tabIndex={0} role="button" aria-label={p.label + ': ' + p.percent + '%'}
              onMouseEnter={() => setAt(i)} onFocus={() => setAt(i)} onClick={() => setAt(i)} />
          </g>
        ))}
      </svg>
      <p className="trend__readout" aria-live="polite"><b>{cur.percent}%</b> · {cur.detail} · {cur.label}</p>
    </div>
  );
}

/* ---------- Tanlangan mavzu paneli ---------- */
function Ring({ percent, tone }: { percent: number; tone: Tone }) {
  const mounted = useMounted();
  const R = 38, C = 2 * Math.PI * R;
  return (
    <svg className={'ring ring--' + tone} viewBox="0 0 96 96" aria-hidden>
      <circle cx="48" cy="48" r={R} className="ring__bg" />
      <circle cx="48" cy="48" r={R} className="ring__fg" strokeDasharray={C} strokeDashoffset={mounted ? C * (1 - percent / 100) : C} transform="rotate(-90 48 48)" />
      <text x="48" y="54" textAnchor="middle" className="ring__text">{percent}%</text>
    </svg>
  );
}

export type Hard = { label: string; total: number; wrong: number; percent: number; topic?: number | null };

export function TopicPanel({ topic, stat, hard, student, onClose }: {
  topic: TopicInfo; stat?: Stat; hard: Hard[]; student: boolean; onClose: () => void;
}) {
  const tone = toneOf(stat);
  const wrong = stat ? stat.total - stat.correct : 0;
  const advice =
    tone === 'none' ? 'Bu mavzu bo‘yicha hali javob yo‘q. Natija test yoki o‘yin ishlangach shu yerda ko‘rinadi.'
    : tone === 'success' ? 'Kuzatilgan natija yuqori. Bilimni mustahkamlash uchun mavzu testini yoki o‘yinni qayta ishlash mumkin.'
    : tone === 'warning' ? 'Natija o‘rta darajada. Xato qilingan savollarni ko‘rib chiqib, mavzu materiallarini takrorlash foydali bo‘ladi.'
    : 'Bu mavzuda bo‘shliq kuzatilmoqda. Avval materiallarni qayta ko‘rib chiqing, keyin mavzu testini qayta ishlang.';
  return (
    <section className={'tpanel tpanel--' + tone} aria-label={topic.globalOrder + '-mavzu tahlili'}>
      <button type="button" className="tpanel__close" onClick={onClose} aria-label="Mavzu tanlovini bekor qilish"><X size={16} /></button>
      <div className="tpanel__head">
        {stat && stat.total > 0 ? <Ring percent={pct(stat)} tone={tone} /> : <div className="ring ring--empty">—</div>}
        <div>
          <div className="tpanel__eyebrow">{topic.globalOrder}-mavzu · {TONE_LABEL[tone]}</div>
          <h3>{topic.title}</h3>
          <p className="muted small">
            {stat && stat.total > 0
              ? <>Kuzatilgan: <b>{stat.total}</b> ta javob, shundan <b>{stat.correct}</b> tasi to‘g‘ri, <b>{wrong}</b> tasi xato.</>
              : 'Natija mavjud emas.'}
          </p>
        </div>
      </div>
      <p className="tpanel__advice">{advice}</p>
      {hard.length > 0 && (
        <div className="tpanel__hard">
          <h4>Ko‘proq xato qilingan savollar</h4>
          <ul>
            {hard.slice(0, 5).map((h) => (
              <li key={h.label}><span>{h.label}</span><b>{h.wrong}/{h.total} xato</b></li>
            ))}
          </ul>
        </div>
      )}
      <div className="tpanel__actions">
        <Link className="btn btn--secondary btn--sm" to={paths.topic(topic.id)}><BookOpen size={14} /> Mavzu sahifasi</Link>
        {student && <>
          <Link className="btn btn--secondary btn--sm" to={paths.topic(topic.id) + '?tab=taqdimot'}><Presentation size={14} /> Slaydlar</Link>
          <Link className="btn btn--secondary btn--sm" to={paths.materials + '?tur=keyslar&mavzu=' + topic.globalOrder}><FileText size={14} /> Keyslar</Link>
          <Link className="btn btn--primary btn--sm" to={paths.test('test-' + topic.id)}><ClipboardCheck size={14} /> Mavzu testi</Link>
        </>}
      </div>
    </section>
  );
}

/* ---------- Qiyin savollar ro‘yxati ---------- */
export function HardList({ rows }: { rows: Hard[] }) {
  const mounted = useMounted();
  if (!rows.length) return <p className="muted">Bu tanlov uchun xato qayd etilgan savol yo‘q.</p>;
  return (
    <ol className="hard">
      {rows.map((r) => (
        <li key={r.label}>
          {r.topic ? <span className="hard__topic">{r.topic}-mavzu</span> : null}
          <span className="hard__q">{r.label}</span>
          <span className="hard__bar"><i style={{ width: mounted ? Math.round((100 * r.wrong) / r.total) + '%' : '0%' }} /></span>
          <span className="hard__meta">{r.wrong} / {r.total} xato · {100 - r.percent}%</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Ko‘p xato qilingan savollar reytingi ---------- */
type QSort = 'count' | 'share';

export function QuestionRanking({ rows }: { rows: Hard[] }) {
  const mounted = useMounted();
  const [sort, setSort] = useState<QSort>('count');
  const [limit, setLimit] = useState(8);
  const [open, setOpen] = useState<string[]>([]);
  if (!rows.length) return <p className="muted">Bu tanlov uchun xato qayd etilgan savol yo‘q.</p>;
  const sorted = [...rows].sort((a, b) => sort === 'count'
    ? b.wrong - a.wrong || b.total - a.total
    : (b.wrong / b.total) - (a.wrong / a.total) || b.wrong - a.wrong);
  const top = Math.max(...sorted.map((r) => (sort === 'count' ? r.wrong : r.wrong / r.total)), 1e-9);
  return (
    <div className="qrank">
      <div className="chips rank-sort" role="group" aria-label="Savollarni tartiblash">
        <ArrowUpDown size={14} aria-hidden />
        {([['count', 'Xato soni bo‘yicha'], ['share', 'Xato ulushi bo‘yicha']] as [QSort, string][]).map(([v, label]) => (
          <button key={v} type="button" className={'chip' + (sort === v ? ' is-on' : '')} aria-pressed={sort === v} onClick={() => setSort(v)}>{label}</button>
        ))}
      </div>
      <p className="small muted qrank__note">Jami {sorted.length} ta savolda xato qayd etilgan. Savol matniga bossangiz, to‘liq ochiladi.</p>
      <ol className="qrank__list">
        {sorted.slice(0, limit).map((r, i) => {
          const share = Math.round((100 * r.wrong) / r.total);
          const isOpen = open.includes(r.label);
          const value = sort === 'count' ? r.wrong : r.wrong / r.total;
          return (
            <li key={r.label} className={'qrank__item' + (i < 3 ? ' qrank__item--top' + (i + 1) : '')} style={{ animationDelay: (i % 8) * 50 + 'ms' }}>
              <span className="qrank__pos">{i + 1}</span>
              <div className="qrank__body">
                <button type="button" className={'qrank__q' + (isOpen ? ' is-open' : '')} aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? open.filter((x) => x !== r.label) : [...open, r.label])}>
                  {r.label}
                  <ChevronDown size={16} aria-hidden />
                </button>
                <span className="qrank__track"><i style={{ width: mounted ? Math.max(4, Math.round((100 * value) / top)) + '%' : '0%' }} /></span>
                <span className="qrank__meta">
                  {r.topic ? <span className="qrank__topic">{r.topic}-mavzu</span> : null}
                  <span>{r.wrong} ta xato / {r.total} ta javob</span>
                </span>
              </div>
              <span className="qrank__pct" title="Xato ulushi">{share}%</span>
            </li>
          );
        })}
      </ol>
      {sorted.length > limit && (
        <button type="button" className="btn btn--secondary btn--sm qrank__more" onClick={() => setLimit((l) => l + 8)}>
          Yana ko‘rsatish ({sorted.length - limit})
        </button>
      )}
    </div>
  );
}
