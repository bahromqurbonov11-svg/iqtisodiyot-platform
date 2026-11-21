import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Presentation } from 'lucide-react';
import { loadTopicContent } from './topicContent';
import { topicStyle } from '@/modules/catalog/topicStyle';

/**
 * Taqdimotni ko‘rish: slaydlar mehmonlar va tashqi foydalanuvchilar uchun ham ochiq.
 * Slayd mazmuni matn ko‘rinishida ko‘rsatiladi; rasm va chizmalar asl faylda bo‘ladi.
 * Boshqarish: tugmalar, klaviatura strelkalari yoki telefonda barmoq bilan surish.
 */
export function ReadOnlySlides({ number }: { number: number }) {
  const [slides, setSlides] = useState<string[][]>();
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const touch = useRef<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const style = topicStyle(number);

  useEffect(() => {
    let active = true;
    void loadTopicContent(number).then(async zip => {
      const file = zip.file('slides.json');
      if (!file) throw new Error('Slides unavailable');
      const pages = JSON.parse(await file.async('string')) as string[][];
      if (active) setSlides(pages);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [number]);

  useEffect(() => {
    strip.current?.querySelector('.slide-thumb.is-on')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index]);
  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [full]);

  if (!slides?.length) return <div className="slides-empty" role="status"><Presentation size={22} aria-hidden />
    <strong>{failed ? 'Taqdimotni ochib bo‘lmadi.' : slides ? 'Bu mavzu uchun slayd hali yo‘q' : 'Taqdimot yuklanmoqda…'}</strong>
  </div>;

  const move = (d: number) => setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + d)));
  const lines = slides[index];
  const [title, ...rest] = lines;

  return (
    <section className={'slidedeck' + (full ? ' is-full' : '')} style={{ ['--gc' as string]: style.color }} aria-label={number + '-mavzu taqdimoti'}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } }}>
      <header className="slidedeck__bar">
        <strong><Presentation size={16} aria-hidden /> {number}-mavzu taqdimoti</strong>
        <span className="slidedeck__count" aria-live="polite">{index + 1} / {slides.length}</span>
        <button type="button" className="icon-btn" onClick={() => setFull((v) => !v)} aria-label={full ? 'Oddiy ko‘rinish' : 'To‘liq ekran'}>
          {full ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </header>
      <div className="slidedeck__stage"
        onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) move(dx < 0 ? 1 : -1);
        }}>
        <button type="button" className="slidedeck__nav slidedeck__nav--prev" onClick={() => move(-1)} disabled={index === 0} aria-label="Oldingi slayd"><ChevronLeft size={26} /></button>
        <article className={index === 0 && !full ? 'slide topic-slide-preview' : 'slide'} key={index}>
          <span className="slide__num">{index + 1}</span>
          {lines.length ? <>
            <h3 className="slide__title">{title}</h3>
            {rest.length > 0 && <ul className="slide__body">{rest.map((line, i) => <li key={i} style={{ ['--i' as string]: i }}>{line}</li>)}</ul>}
          </> : <p className="slide__note">Bu slayd faqat tasvir yoki chizmadan iborat.</p>}
        </article>
        <button type="button" className="slidedeck__nav slidedeck__nav--next" onClick={() => move(1)} disabled={index >= slides.length - 1} aria-label="Keyingi slayd"><ChevronRight size={26} /></button>
      </div>
      <div className="slidedeck__progress" aria-hidden><i style={{ width: ((index + 1) / slides.length) * 100 + '%' }} /></div>
      <div className="slidedeck__strip" ref={strip}>
        {slides.map((s, i) => (
          <button key={i} type="button" className={'slide-thumb' + (i === index ? ' is-on' : '')} onClick={() => setIndex(i)} aria-label={(i + 1) + '-slayd'}>
            <b>{i + 1}</b><span>{s[0] ?? 'Tasvir'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
