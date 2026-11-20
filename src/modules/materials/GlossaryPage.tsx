import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookA, ChevronDown, Dices, Search, Star, X } from 'lucide-react';
import { CountUp } from '@/components/motion/Motion';
import { glossaryTranslations } from '@/data/glossary-translations';
import { useI18n } from '@/i18n';
import { paths } from '@/navigation/paths';

type GlossaryEntry = { term: string; definitions: string[] };

const LONG = 150;
const PAGE = 36;
const palette = ['var(--g-teal)', 'var(--g-blue)', 'var(--g-violet)', 'var(--g-coral)', 'var(--g-amber)'];
const FAV_KEY = 'econ-glossary-fav';

function normalize(text: string) {
  return text.normalize('NFC').toLowerCase().replace(/[‘’ʻʼ´']/g, '').replace(/\s+/g, ' ').trim();
}
const letterOf = (term: string) => term.trim().charAt(0).toUpperCase();
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Mark({ text, words }: { text: string; words: string[] }): ReactNode {
  const clean = words.map(escapeRe).filter(Boolean);
  if (!clean.length) return text;
  const parts = text.split(new RegExp('(' + clean.join('|') + ')', 'ig'));
  return parts.map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : part));
}

function loadFav(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch { return []; }
}

export function GlossaryPage() {
  const { locale, t } = useI18n();
  const labels = {
    uz: ['Glossariy', 'Iqtisodiy atamalar va ularning ta’riflari', 'Atama yoki ta’rifni yozing…', 'Qidiruvga mos atama yoki ta’rif topilmadi.', 'ta atama', 'Glossariy yuklanmoqda…', 'Glossariyni yuklab bo‘lmadi.'],
    ru: ['Глоссарий', 'Экономические термины и их определения', 'Введите термин или определение…', 'Ничего не найдено.', 'терминов', 'Загрузка глоссария…', 'Не удалось загрузить глоссарий.'],
    en: ['Glossary', 'Economic terms and their definitions', 'Enter a term or definition…', 'No matching terms or definitions.', 'terms', 'Loading glossary…', 'Could not load the glossary.'],
  }[locale];
  const [entries, setEntries] = useState<GlossaryEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [fav, setFav] = useState<string[]>(loadFav);
  const [open, setOpen] = useState<string[]>([]);
  const [limit, setLimit] = useState(PAGE);
  const [spot, setSpot] = useState<string>();

  useEffect(() => {
    let mounted = true;
    import('../../../iqtisodiyot-glossariy.json').then(({ default: terms }) => {
      if (mounted) setEntries(terms);
    }).catch(() => { if (mounted) setLoadError(true); });
    return () => { mounted = false; };
  }, []);

  const words = normalize(query).split(' ').filter(Boolean);
  const rawWords = query.trim().split(/\s+/).filter(Boolean);

  const list = useMemo(() => (entries ?? []).map(entry => {
    const translated = locale !== 'uz' ? glossaryTranslations[entry.term]?.[locale] : undefined;
    return { ...entry, translated };
  }), [entries, locale]);

  const letters = useMemo(() => [...new Set(list.map(e => letterOf(e.term)))].sort((a, b) => a.localeCompare(b, 'uz')), [list]);

  const results = list.filter(({ term, definitions, translated }) => {
    if (letter && letterOf(term) !== letter) return false;
    if (onlyFav && !fav.includes(term)) return false;
    const haystack = normalize([term, ...definitions, ...(translated ?? [])].join(' '));
    return words.every(word => haystack.includes(word));
  });

  function toggleFav(term: string) {
    setFav(current => {
      const next = current.includes(term) ? current.filter(x => x !== term) : [...current, term];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* xotira yopiq */ }
      return next;
    });
  }
  const toggleOpen = (term: string) => setOpen(current => current.includes(term) ? current.filter(x => x !== term) : [...current, term]);
  function surprise() {
    if (!list.length) return;
    const pick = list[Math.floor(Math.random() * list.length)];
    setSpot(pick.term);
  }
  const spotEntry = list.find(e => e.term === spot);
  const filtering = Boolean(query.trim() || letter || onlyFav);

  return (
    <div className="gloss">
      <section className="gloss-hero">
        <span className="gloss-hero__orb" aria-hidden />
        <div className="container gloss-hero__inner">
          <nav className="crumbs about-hero__crumbs" aria-label="Yo‘l">
            <Link to={paths.materials}>{t.nav.materials}</Link> <span aria-hidden>›</span> <span aria-current="page">{labels[0]}</span>
          </nav>
          <div className="gloss-hero__row">
            <span className="gloss-hero__icon"><BookA size={34} aria-hidden /></span>
            <div>
              <h1>{labels[0]}</h1>
              <p>{labels[1]}</p>
            </div>
            <div className="gloss-hero__count"><b><CountUp to={entries?.length ?? 0} /></b><span>{labels[4]}</span></div>
          </div>
          <div className="gloss-search">
            <Search size={20} aria-hidden />
            <input type="search" value={query} placeholder={labels[2]} aria-label={labels[2]}
              onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} />
            {query && <button type="button" className="gloss-search__clear" aria-label="Tozalash" onClick={() => setQuery('')}><X size={18} /></button>}
          </div>
          <div className="gloss-tools">
            <button type="button" className="gloss-tool" onClick={surprise}><Dices size={17} aria-hidden /> Tasodifiy atama</button>
            <button type="button" className={'gloss-tool' + (onlyFav ? ' is-on' : '')} aria-pressed={onlyFav}
              onClick={() => { setOnlyFav(v => !v); setLimit(PAGE); }}>
              <Star size={17} aria-hidden /> Saqlanganlar <span>{fav.length}</span>
            </button>
          </div>
        </div>
      </section>

      <div className="container gloss-body">
        {spotEntry && (
          <div className="gloss-spot" key={spotEntry.term}>
            <button type="button" className="gloss-spot__close" aria-label="Yopish" onClick={() => setSpot(undefined)}><X size={18} /></button>
            <small>Tasodifiy atama</small>
            <strong>{spotEntry.translated?.[0] ?? spotEntry.term}</strong>
            <p>{(spotEntry.translated ? [spotEntry.translated[1]] : spotEntry.definitions).join(' ')}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={surprise}><Dices size={15} aria-hidden /> Yana bitta</button>
          </div>
        )}

        {letters.length > 0 && (
          <div className="gloss-letters" role="tablist" aria-label="Harf bo‘yicha">
            <button type="button" className={'gloss-letter' + (!letter ? ' is-on' : '')} onClick={() => { setLetter(''); setLimit(PAGE); }}>Hammasi</button>
            {letters.map(l => (
              <button key={l} type="button" role="tab" aria-selected={letter === l} className={'gloss-letter' + (letter === l ? ' is-on' : '')}
                onClick={() => { setLetter(letter === l ? '' : l); setLimit(PAGE); }}>{l}</button>
            ))}
          </div>
        )}

        {loadError && <p role="alert">{labels[6]}</p>}
        {!entries && !loadError && <p role="status">{labels[5]}</p>}
        {entries && (
          <>
            <p className="small muted" aria-live="polite">{filtering ? results.length + ' / ' : ''}{entries.length} {labels[4]}</p>
            {results.length === 0 ? <p className="gloss-empty">{labels[3]}</p> : (
              <dl className="gloss-grid">
                {results.slice(0, limit).map(({ term, definitions, translated }, i) => {
                  const text = (translated ? [translated[1]] : definitions).join(' ');
                  const long = text.length > LONG;
                  const isOpen = open.includes(term);
                  const starred = fav.includes(term);
                  const color = palette[(letterOf(term).charCodeAt(0)) % palette.length];
                  return (
                    <div key={term} className={'gloss-card' + (starred ? ' is-fav' : '')} style={{ ['--gc' as string]: color, animationDelay: (i % PAGE) * 18 + 'ms' }}>
                      <div className="gloss-card__head">
                        <span className="gloss-card__letter">{letterOf(term)}</span>
                        <dt lang={translated ? locale : 'uz'}><Mark text={translated?.[0] ?? term} words={rawWords} /></dt>
                        <button type="button" className={'gloss-star' + (starred ? ' is-on' : '')} aria-pressed={starred}
                          aria-label={starred ? 'Saqlanganlardan olib tashlash' : 'Saqlash'} onClick={() => toggleFav(term)}>
                          <Star size={19} aria-hidden />
                        </button>
                      </div>
                      <dd lang={translated ? locale : 'uz'} className={long && !isOpen ? 'is-clamped' : ''}>
                        <Mark text={text} words={rawWords} />
                      </dd>
                      {long && (
                        <button type="button" className="gloss-more" aria-expanded={isOpen} onClick={() => toggleOpen(term)}>
                          {isOpen ? 'Yig‘ish' : 'Batafsil'} <ChevronDown size={16} aria-hidden />
                        </button>
                      )}
                    </div>
                  );
                })}
              </dl>
            )}
            {results.length > limit && (
              <div className="gloss-foot">
                <button type="button" className="btn btn--secondary" onClick={() => setLimit(l => l + PAGE)}>
                  Yana ko‘rsatish ({results.length - limit})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
