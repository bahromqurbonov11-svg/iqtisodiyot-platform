import { useEffect, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, ChevronDown, Clock, GraduationCap, Layers, Pause, Play, Target, Brain, Compass,
} from 'lucide-react';
import { CountUp, Reveal } from '@/components/motion/Motion';
import { catalogService } from '@/services/catalog.service';
import { topicStyle } from '@/modules/catalog/topicStyle';
import { references } from '@/data/subject';
import { paths } from '@/navigation/paths';
import { appConfig } from '@/config/app.config';
import { EconomicCycleDiagram } from './EconomicCycleDiagram';
import { useI18n } from '@/i18n';

const aboutHeadings = {
  uz: ['Iqtisodiyot nazariyasi: fan nimani o‘rgatadi?', 'Qismni tanlang', 'O‘quv yuklamasi', 'Mavzular yo‘l xaritasi', 'Ta’lim natijalari'],
  ru: ['Экономическая теория: чему учит курс?', 'Выберите часть', 'Учебная нагрузка', 'Карта тем', 'Результаты обучения'],
  en: ['Economic theory: what will you learn?', 'Choose a course part', 'Course workload', 'Topic roadmap', 'Learning outcomes'],
} as const;

function navigateTabs(event: KeyboardEvent<HTMLDivElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const index = tabs.findIndex(tab => tab === event.target);
  if (index < 0) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
    : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].focus();
  tabs[next].click();
}

const kindLabel = { knowledge: 'Bilim', skill: 'Ko‘nikma', competence: 'Malaka' } as const;
type Kind = keyof typeof kindLabel;

/** Diagnostik zanjir: har bir bosqich uchun qisqa izoh va NAMUNA (illyustratsiya). */
const chain = [
  { key: 'Fan', text: 'Barcha savollar bitta fanga — Iqtisodiyot nazariyasiga bog‘lanadi.', example: 'Iqtisodiyot nazariyasi (IQN11210)' },
  { key: 'Mavzu', text: 'Fan 25 mavzuga bo‘lingan. Har bir savol aniq bir mavzuga tegishli.', example: '6-mavzu. Talab, taklif, bozor muvozanati' },
  { key: 'Tushuncha', text: 'Mavzu ichida alohida tushunchalar ajratiladi — bilimdagi bo‘shliq aynan shu darajada ko‘rinadi.', example: 'Talab qonuni' },
  { key: 'Ko‘nikma', text: 'Tushunchani eslab qolish, tushunish yoki qo‘llash darajasi alohida baholanadi.', example: 'Grafikdan muvozanat narxini topa olish' },
  { key: 'Savol', text: 'Test yoki o‘yin savoli tushuncha va ko‘nikmaga bog‘lab yoziladi.', example: 'Narx oshganda talab miqdori qanday o‘zgaradi?' },
  { key: 'Javob', text: 'Talabaning har bir javobi va urinishi alohida saqlanadi.', example: 'Tanlangan variant: «talab oshadi»' },
  { key: 'Xato turi', text: 'Noto‘g‘ri variantlar aniq chalkashlikka bog‘lanadi — shu sabab xatoning ehtimoliy sababi ko‘rinadi.', example: 'Talab miqdori va talabning o‘zgarishini adashtirish' },
];

const faq = [
  { q: 'Ro‘yxatdan o‘tmasdan nimalarni ko‘rish mumkin?', a: 'Mavzular katalogi, tushunchalar, ma’ruza matnlari, glossariy, keyslar va taqdimot slaydlari ochiq. Natijalar saqlanishi va kabinetda ko‘rinishi uchun ro‘yxatdan o‘tish kerak.' },
  { q: 'Diagnostik test oddiy testdan nimasi bilan farq qiladi?', a: 'Oddiy test faqat umumiy ball beradi. Diagnostik test esa har bir savolni mavzu va tushunchaga bog‘laydi, shuning uchun qaysi tushunchada chalkashlik borligi ko‘rinadi.' },
  { q: 'O‘yinlar nima uchun kerak?', a: 'O‘yinlar bilimni qiziqarli shaklda tekshiradi. Har bir o‘yin natijasi ham mavzu bilan bog‘lanadi va kabinetingizdagi tahlilga qo‘shiladi.' },
  { q: 'Mening natijamni kim ko‘radi?', a: 'Talaba o‘z natijalarini kabinetida ko‘radi. Fan administratori (o‘qituvchi) o‘z talabalarining faoliyati va natijalarini ko‘radi.' },
  { q: 'Bajarilmagan topshiriq nolga teng deb olinadimi?', a: 'Yo‘q. Platforma bajarilmagan topshiriqni “bilim yo‘q” deb hisoblamaydi: u faqat ma’lumot yetishmasligini bildiradi.' },
];

type DonutItem = { key: string; label: string; value: number; color: string };

function Donut({ items, active, selected, onPreview, onSelect }: {
  items: DonutItem[];
  active: string | null;
  selected: string | null;
  onPreview: (key: string | null) => void;
  onSelect: (key: string) => void;
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 200 200" className="donut" role="group" aria-label="O‘quv yuklamasi taqsimoti">
      <circle cx="100" cy="100" r={r} fill="none" stroke="#edf0ea" strokeWidth="26" />
      {items.map((i, idx) => {
        const len = (c * i.value) / total;
        const seg = (
          <circle
            key={i.key}
            className={'donut__seg' + (active === i.key ? ' is-on' : '') + (active && active !== i.key ? ' is-dim' : '')}
            style={{ animationDelay: idx * 0.18 + 's' }}
            cx="100" cy="100" r={r} fill="none" stroke={i.color}
            strokeWidth={26}
            strokeDasharray={len + ' ' + (c - len)} strokeDashoffset={-offset}
            transform="rotate(-90 100 100)"
            tabIndex={0}
            role="button"
            aria-label={i.label + ', ' + i.value + ' soat'}
            aria-pressed={selected === i.key}
            onPointerEnter={event => { if (event.pointerType === 'mouse') onPreview(i.key); }}
            onPointerLeave={event => { if (event.pointerType === 'mouse') onPreview(null); }}
            onFocus={event => { if (event.currentTarget.matches(':focus-visible')) onPreview(i.key); }}
            onBlur={() => onPreview(null)}
            onClick={() => onSelect(i.key)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(i.key);
              }
            }}
          />
        );
        offset += len;
        return seg;
      })}
      {[{ key: null, value: total, label: 'soat jami' },
        ...items.map(i => ({ ...i, label: i.label + ' · ' + Math.round((100 * i.value) / total) + '%' })),
      ].map(i => (
        <g key={i.key ?? 'total'} className={'donut__readout' + (i.key === active ? ' is-on' : '')} aria-hidden="true">
          <text x="100" y="96" textAnchor="middle" className="donut__big">{i.value}</text>
          <text x="100" y="118" textAnchor="middle" className="donut__small">{i.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function AboutPage() {
  const { locale } = useI18n();
  const [title, choosePart, workload, roadmap, learningOutcomes] = aboutHeadings[locale];
  const subject = catalogService.getSubject().data;
  const allTopics = catalogService.getTopics().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const [kind, setKind] = useState<Kind | 'all'>('all');
  const [hoverSeg, setHoverSeg] = useState<string | null>(null);
  const [selectedSeg, setSelectedSeg] = useState<string | null>(null);
  const activeSeg = hoverSeg ?? selectedSeg;
  const selectSegment = (key: string) => setSelectedSeg(current => current === key ? null : key);
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const part = subject.parts.find((p) => p.id === partId)!;
  const partTopics = allTopics.filter((t) => t.partId === partId);
  const totalCredits = subject.parts.reduce((s, p) => s + p.credits, 0);
  const totalHours = subject.parts.reduce((s, p) => s + p.totalHours, 0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % chain.length), 2600);
    return () => window.clearInterval(timer);
  }, [playing]);

  const donut: DonutItem[] = [
    { key: 'lecture', label: 'Ma’ruza', value: part.lectureHours, color: 'var(--g-teal)' },
    { key: 'practice', label: 'Amaliy', value: part.practiceHours, color: 'var(--g-amber)' },
    { key: 'self', label: 'Mustaqil', value: part.selfStudyHours, color: 'var(--g-violet)' },
  ];
  const outcomes = part.outcomes.filter((o) => kind === 'all' || o.kind === kind);
  const cur = chain[step];

  return (
    <div className="about" lang="uz">
      {/* ---------- Kirish bloki ---------- */}
      <section className="about-hero">
        <span className="about-hero__orb about-hero__orb--a" aria-hidden />
        <span className="about-hero__orb about-hero__orb--b" aria-hidden />
        <div className="container about-hero__inner">
          <nav className="crumbs about-hero__crumbs" aria-label="Yo‘l">
            <Link to={paths.home}>Bosh sahifa</Link> <span aria-hidden>›</span> <span aria-current="page">Fan haqida</span>
          </nav>
          <div className="about-hero__grid">
          <div>
          <div className="eyebrow about-hero__eyebrow">Fan kodi {subject.code} · {appConfig.organization.name}</div>
          <h1 className="about-hero__title" lang={locale}>{title}</h1>
          <p className="about-hero__lead">
            Fan iqtisodiy tafakkurni shakllantiradi: cheklangan resurslar sharoitida tanlov, bozor mexanizmlari,
            makroiqtisodiy jarayonlar va davlat siyosatini tahlil qilishga o‘rgatadi.
          </p>
          <div className="about-hero__stats">
            <div><b><CountUp to={allTopics.length} /></b><span>mavzu</span></div>
            <div><b><CountUp to={subject.parts.length} /></b><span>qism</span></div>
            <div><b><CountUp to={totalCredits} /></b><span>ECTS kredit</span></div>
            <div><b><CountUp to={totalHours} /></b><span>soat</span></div>
          </div>
          <p className="about-hero__src">Manba: rasmiy sillabuslar (2026–2027)</p>
          </div>
          <EconomicCycleDiagram />
          </div>
        </div>
      </section>

      <div className="container about-body">
        {/* ---------- Qism tanlash ---------- */}
        <Reveal>
          <h2 className="about-h" lang={locale}>{choosePart}</h2>
          <div className="part-pick" role="tablist" aria-label="Fan qismlari" onKeyDown={navigateTabs}>
            {subject.parts.map((p, i) => {
              const n = allTopics.filter((t) => t.partId === p.id).length;
              return (
                <button
                  key={p.id} type="button" role="tab" aria-selected={p.id === partId} tabIndex={p.id === partId ? 0 : -1}
                  className={'part-pick__card' + (p.id === partId ? ' is-on' : '')}
                  style={{ ['--gc' as string]: i === 0 ? 'var(--g-teal)' : 'var(--g-blue)' }}
                  onClick={() => { setPartId(p.id); setOpenTopic(null); setHoverSeg(null); setSelectedSeg(null); }}
                >
                  <span className="part-pick__num">{p.order}</span>
                  <strong>{p.title}</strong>
                  <small>{n} mavzu · {p.credits} kredit · {p.totalHours} soat</small>
                </button>
              );
            })}
          </div>
          <p className="about-goal" key={partId}><Target size={20} aria-hidden /> <span><b>Fanning maqsadi.</b> {part.goal}</span></p>
        </Reveal>

        {/* ---------- Yuklama ---------- */}
        <Reveal>
          <div className="about-load">
            <div className="about-load__chart" key={partId}>
              <Donut items={donut} active={activeSeg} selected={selectedSeg} onPreview={setHoverSeg} onSelect={selectSegment} />
            </div>
            <div className="about-load__text">
              <h2 className="about-h" lang={locale}><Clock size={22} aria-hidden /> {workload}</h2>
              <p className="muted small">Diagramma bo‘laklariga bosing yoki ustiga olib boring.</p>
              <ul className="about-legend">
                {donut.map((d) => (
                  <li key={d.key}>
                    <button
                      type="button" className={'about-legend__btn' + (activeSeg === d.key ? ' is-on' : '')}
                      aria-pressed={selectedSeg === d.key}
                      onPointerEnter={event => { if (event.pointerType === 'mouse') setHoverSeg(d.key); }}
                      onPointerLeave={event => { if (event.pointerType === 'mouse') setHoverSeg(null); }}
                      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setHoverSeg(d.key); }}
                      onBlur={() => setHoverSeg(null)}
                      onClick={() => selectSegment(d.key)}
                    >
                      <i style={{ background: d.color }} aria-hidden />
                      <span>{d.label}</span>
                      <b>{d.value} soat <small>{Math.round(100 * d.value / part.totalHours)}%</small></b>
                    </button>
                  </li>
                ))}
              </ul>
              <dl className="about-kv">
                <div><dt>ECTS kreditlar</dt><dd>{part.credits}</dd></div>
                <div><dt>Jami yuklama</dt><dd>{part.totalHours} soat</dd></div>
                <div><dt>Ta’lim tili</dt><dd>O‘zbek / rus</dd></div>
              </dl>
            </div>
          </div>
        </Reveal>

        {/* ---------- Yo‘l xaritasi ---------- */}
        <Reveal>
          <h2 className="about-h" lang={locale}><Compass size={22} aria-hidden /> {roadmap}</h2>
          <p className="muted small">Mavzuga bosing — kichik mavzular ochiladi.</p>
          <ol className="road" key={partId}>
            {partTopics.map((t, i) => {
              const st = topicStyle(t.globalOrder);
              const open = openTopic === t.id;
              return (
                <li key={t.id} className={'road__item' + (open ? ' is-open' : '')} style={{ ['--gc' as string]: st.color, animationDelay: i * 45 + 'ms' }}>
                  <button type="button" className="road__head" aria-expanded={open} onClick={() => setOpenTopic(open ? null : t.id)}>
                    <span className="road__dot"><st.icon size={18} aria-hidden /></span>
                    <span className="road__text">
                      <small>{t.globalOrder}-mavzu · {t.lectureHours} soat ma’ruza, {t.practiceHours} soat amaliy</small>
                      <strong>{t.title}</strong>
                    </span>
                    <ChevronDown className="road__chev" size={20} aria-hidden />
                  </button>
                  {open && (
                    <div className="road__body">
                      {t.subtopics.length > 0 && <ul>{t.subtopics.map((s) => <li key={s}>{s}</li>)}</ul>}
                      <Link to={paths.topic(t.id)} className="btn btn--secondary btn--sm">Mavzuni ochish <ArrowRight size={15} aria-hidden /></Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* ---------- Ta'lim natijalari ---------- */}
        <Reveal>
          <h2 className="about-h" lang={locale}><GraduationCap size={22} aria-hidden /> {learningOutcomes}</h2>
          <p className="muted small">Fanni o‘zlashtirgan talaba…</p>
          <div className="chips" role="tablist" aria-label="Ta’lim natijasi turi" onKeyDown={navigateTabs}>
            {(['all', 'knowledge', 'skill', 'competence'] as const).map((k) => {
              const count = k === 'all' ? part.outcomes.length : part.outcomes.filter((o) => o.kind === k).length;
              return (
                <button key={k} type="button" role="tab" aria-selected={kind === k} tabIndex={kind === k ? 0 : -1} className={'chip' + (kind === k ? ' is-on' : '')} onClick={() => setKind(k)}>
                  {k === 'all' ? 'Barchasi' : kindLabel[k]} <span>{count}</span>
                </button>
              );
            })}
          </div>
          <div className={'outg-grid' + (kind === 'all' ? '' : ' outg-grid--one')} key={partId + kind}>
            {(['knowledge', 'skill', 'competence'] as const).filter((k) => kind === 'all' || kind === k).map((k) => {
              const items = outcomes.filter((o) => o.kind === k);
              if (!items.length) return null;
              return (
                <section key={k} className={'outg outg--' + k} aria-label={kindLabel[k]}>
                  <header className="outg__head"><strong>{kindLabel[k]}</strong><span>{items.length}</span></header>
                  <ol className="outg__list">
                    {items.map((o, i) => (
                      <li key={o.code} style={{ animationDelay: i * 50 + 'ms' }}>
                        <b className="outg__code">{o.code}</b>
                        <p>{o.text}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        </Reveal>

        {/* ---------- Diagnostik yondashuv ---------- */}
        <Reveal>
          <div className="diag">
            <div className="diag__head">
              <h2 className="about-h"><Brain size={22} aria-hidden /> Diagnostik yondashuv</h2>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
                {playing ? <><Pause size={15} aria-hidden /> To‘xtatish</> : <><Play size={15} aria-hidden /> Avtomatik ko‘rsatish</>}
              </button>
            </div>
            <p className="muted small">Platformada har bir savol quyidagi zanjirga bog‘lanadi. Bosqichni tanlang:</p>
            <ol className="diag__chain">
              {chain.map((c, i) => (
                <li key={c.key}>
                  <button type="button" className={'diag__step' + (i === step ? ' is-on' : '') + (i < step ? ' is-done' : '')}
                    onClick={() => { setStep(i); setPlaying(false); }}>
                    <b>{i + 1}</b><span>{c.key}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="diag__panel" key={step}>
              <p>{cur.text}</p>
              <div className="diag__example"><small>Namuna (illyustratsiya)</small><strong>{cur.example}</strong></div>
            </div>
            <p className="small">Shu tufayli natija “umumiy ball” emas, balki aynan qaysi tushunchada qanday chalkashlik borligini ko‘rsatadi.</p>
          </div>
        </Reveal>

        {/* ---------- Savol-javob ---------- */}
        <Reveal>
          <h2 className="about-h"><Layers size={22} aria-hidden /> Ko‘p so‘raladigan savollar</h2>
          <div className="faq">
            {faq.map((f, i) => (
              <div key={f.q} className={'faq__item' + (openFaq === i ? ' is-open' : '')}>
                <button type="button" className="faq__q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span><ChevronDown size={20} aria-hidden />
                </button>
                {openFaq === i && <p className="faq__a">{f.a}</p>}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="about-cta">
            <div>
              <h2>{part.title} mavzularini o‘rganishni boshlang</h2>
              <p>Mavzu sahifasida tushunchalar, jonli grafik, taqdimot va diagnostik test bir joyda.</p>
            </div>
            <Link to={paths.topics + '?qism=' + part.id} className="btn btn--primary">
              <BookOpen size={17} aria-hidden /> Mavzularga o‘tish <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <details className="refs-box">
            <summary>Asosiy va qo‘shimcha adabiyotlar, axborot manbalari</summary>
            <ol className="refs">
              {Object.entries(references).slice(0, 11).map(([n, r]) => (
                <li key={n}><span className="refs__n">[{n}]</span> {r}</li>
              ))}
            </ol>
            <h4 className="mt-4">Axborot manbalari</h4>
            <ol className="refs">
              {Object.entries(references).slice(11).map(([n, r]) => (
                <li key={n}><span className="refs__n">[{n}]</span> {r}</li>
              ))}
            </ol>
          </details>
        </Reveal>
      </div>
    </div>
  );
}
