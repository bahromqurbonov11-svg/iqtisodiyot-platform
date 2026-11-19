import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * UMUMIY HARAKAT (ANIMATSIYA) KOMPONENTLARI
 * Barcha sahifalar shu yerdan foydalanadi. Uslublar: src/styles/motion.css.
 * Foydalanuvchi "harakatni kamaytirish" sozlamasini yoqqan bo‘lsa, CSS animatsiyalarni o‘chiradi.
 */

/** Element ekranga kirganda bir marta true bo‘ladi. */
export function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
      },
      { threshold, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Sahifa aylantirilganda mazmunni silliq paydo qiladi. */
export function Reveal({
  children, delay = 0, as: Tag = 'div', className = '', ...rest
}: { children: ReactNode; delay?: number; as?: 'div' | 'section' | 'li' | 'article'; className?: string } & HTMLAttributes<HTMLElement>) {
  const [ref, seen] = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={`reveal${seen ? ' is-in' : ''} ${className}`.trim()}
      style={{ ['--reveal-delay' as string]: `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Raqam 0 dan nishonga qadar sanab chiqadi (ko‘ringanda). */
export function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setValue(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, duration]);
  return <span ref={ref}>{value}</span>;
}

/** Sahifaning yuqorisidagi o‘qish ko‘rsatkichi. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      bar.current?.style.setProperty('--p', String(p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div className="scroll-progress" ref={bar} aria-hidden />;
}

/** Pastga aylantirilganda paydo bo‘ladigan "yuqoriga" tugmasi. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      className={`to-top${show ? ' is-visible' : ''}`}
      aria-label="Sahifa boshiga qaytish"
      tabIndex={show ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ArrowUp size={18} />
    </button>
  );
}

/** Sichqoncha harakatiga qarab ozgina qiyshayadigan blok (faqat sichqonchali qurilmalarda). */
export function Tilt({ children, className = '', max = 6, ...rest }: { children: ReactNode; className?: string; max?: number } & HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--mx', x.toFixed(3));
    el.style.setProperty('--my', y.toFixed(3));
    el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    ['--mx', '--my', '--rx', '--ry'].forEach((k) => el.style.setProperty(k, '0'));
  };
  return (
    <div ref={ref} className={`tilt ${className}`.trim()} onPointerMove={move} onPointerLeave={leave} {...rest}>
      {children}
    </div>
  );
}
