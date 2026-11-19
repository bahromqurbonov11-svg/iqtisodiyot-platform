import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, List, Layers, RotateCw, Check } from 'lucide-react';

/**
 * Asosiy tushunchalar: ro‘yxat yoki aylanadigan o‘quv kartochkalari.
 * Kartochkalar — o‘z-o‘zini tekshirish uchun mashq. "Bilaman" belgilari faqat shu sahifada,
 * brauzer xotirasida turadi va hech qayerga saqlanmaydi, baholanmaydi.
 */
export function ConceptCards({ concepts }: { concepts: readonly (readonly [string, string])[] }) {
  const [mode, setMode] = useState<'list' | 'cards'>('list');
  const [order, setOrder] = useState<number[]>(() => concepts.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  // Mavzu almashganda holatni tiklash
  const signature = useMemo(() => concepts.map(([t]) => t).join('|'), [concepts]);
  useEffect(() => {
    setOrder(concepts.map((_, i) => i));
    setPos(0); setFlipped(false); setKnown(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const current = order[pos];
  const [term, definition] = concepts[current] ?? ['', ''];
  const go = (delta: number) => {
    setFlipped(false);
    setPos((p) => (p + delta + order.length) % order.length);
  };
  const shuffle = () => {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next); setPos(0); setFlipped(false);
  };
  const mark = () => {
    setKnown((k) => {
      const n = new Set(k);
      n.has(current) ? n.delete(current) : n.add(current);
      return n;
    });
  };

  return (
    <div className="concepts">
      <div className="concepts__switch" role="group" aria-label="Ko‘rinish">
        <button type="button" className={mode === 'list' ? 'is-active' : ''} aria-pressed={mode === 'list'} onClick={() => setMode('list')}>
          <List size={14} /> Ro‘yxat
        </button>
        <button type="button" className={mode === 'cards' ? 'is-active' : ''} aria-pressed={mode === 'cards'} onClick={() => setMode('cards')}>
          <Layers size={14} /> Kartochkalar
        </button>
      </div>

      {mode === 'list' ? (
        <dl className="stack stack--sm" aria-label="Mavzuning asosiy tushunchalari">
          {concepts.map(([t, def]) => (
            <div key={t} className="concept-row">
              <dt><strong>{t}</strong></dt>
              <dd className="small muted" style={{ margin: 0 }}>{def}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flashdeck" onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}>
          <div className="flashdeck__meta">
            <span>{pos + 1} / {order.length}</span>
            <span className="flashdeck__known"><Check size={13} /> Bilaman: {known.size}</span>
          </div>
          <div className="flashdeck__bar" aria-hidden><i style={{ width: `${(known.size / concepts.length) * 100}%` }} /></div>
          <button
            type="button"
            className={`flashcard${flipped ? ' is-flipped' : ''}${known.has(current) ? ' is-known' : ''}`}
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? `Ta’rif: ${definition}. Tushuncha: ${term}` : `Tushuncha: ${term}. Ta’rifni ko‘rish uchun bosing`}
          >
            <span className="flashcard__inner">
              <span className="flashcard__face flashcard__front">
                <small>Tushuncha</small>
                <strong>{term}</strong>
                <em><RotateCw size={13} /> Ta’rifni ko‘rish uchun bosing</em>
              </span>
              <span className="flashcard__face flashcard__back">
                <small>{term}</small>
                <span className="flashcard__def">{definition}</span>
              </span>
            </span>
          </button>
          <div className="flashdeck__actions">
            <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Oldingi kartochka"><ChevronLeft size={18} /></button>
            <button type="button" className={`pill-btn${known.has(current) ? ' is-on' : ''}`} onClick={mark} aria-pressed={known.has(current)}>
              <Check size={14} /> {known.has(current) ? 'Bilaman ✓' : 'Bilaman'}
            </button>
            <button type="button" className="pill-btn" onClick={shuffle}><Shuffle size={14} /> Aralashtirish</button>
            <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Keyingi kartochka"><ChevronRight size={18} /></button>
          </div>
          <p className="xs muted flashdeck__hint">Mashq belgilari saqlanmaydi va bahoga ta’sir qilmaydi.</p>
        </div>
      )}
    </div>
  );
}
