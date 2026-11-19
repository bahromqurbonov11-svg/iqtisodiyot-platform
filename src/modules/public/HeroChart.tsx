import { useEffect, useRef } from 'react';

/**
 * Bosh sahifadagi doimiy harakatdagi talab-taklif grafigi.
 * Talab (D) va taklif (S) chiziqlari sekin siljib turadi, muvozanat nuqtasi ularning kesishgan joyidan ergashadi.
 * Animatsiya requestAnimationFrame bilan ishlaydi, sahifa yashirilsa to‘xtaydi.
 * "Harakatni kamaytirish" yoqilgan bo‘lsa, grafik qimirlamay turadi.
 */
const X0 = 40, X1 = 304, Y0 = 18, Y1 = 196;
const M = 0.58;            // chiziqlar qiyaligi
const A = 38, B = 176;     // D va S ning boshlang‘ich balandligi (x = 50 da)
const XS = 50;

export function HeroChart() {
  const d = useRef<SVGGElement>(null);
  const s = useRef<SVGGElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const vLine = useRef<SVGLineElement>(null);
  const hLine = useRef<SVGLineElement>(null);
  const pText = useRef<SVGTextElement>(null);
  const qText = useRef<SVGTextElement>(null);
  const shade = useRef<SVGPathElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const draw = (t: number) => {
      const o1 = Math.sin(t / 1700) * 22 + Math.sin(t / 3100 + 1) * 8;      // talab siljishi
      const o2 = Math.sin(t / 2300 + 2) * 20 + Math.sin(t / 3700) * 8;       // taklif siljishi
      const a = A + o1;
      const b = B + o2;
      const dx = (b - a) / (2 * M);
      const ex = XS + dx;
      const ey = (a + b) / 2;
      d.current?.setAttribute('transform', 'translate(0 ' + o1.toFixed(2) + ')');
      s.current?.setAttribute('transform', 'translate(0 ' + o2.toFixed(2) + ')');
      dot.current?.setAttribute('cx', ex.toFixed(2));
      dot.current?.setAttribute('cy', ey.toFixed(2));
      ring.current?.setAttribute('cx', ex.toFixed(2));
      ring.current?.setAttribute('cy', ey.toFixed(2));
      ring.current?.setAttribute('r', (13 + Math.sin(t / 380) * 4).toFixed(2));
      vLine.current?.setAttribute('x1', ex.toFixed(2));
      vLine.current?.setAttribute('x2', ex.toFixed(2));
      vLine.current?.setAttribute('y1', ey.toFixed(2));
      hLine.current?.setAttribute('x2', ex.toFixed(2));
      hLine.current?.setAttribute('y1', ey.toFixed(2));
      hLine.current?.setAttribute('y2', ey.toFixed(2));
      pText.current?.setAttribute('y', (ey + 4).toFixed(2));
      qText.current?.setAttribute('x', (ex - 7).toFixed(2));
      shade.current?.setAttribute('d', 'M' + XS + ' ' + a.toFixed(1) + ' L' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ' L' + XS + ' ' + b.toFixed(1) + ' Z');
    };
    if (reduce) { draw(0); return; }
    const loop = (now: number) => { draw(now); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const xe = X1 - XS;
  return (
    <svg viewBox="0 0 320 220" className="hero-visual__chart" aria-hidden>
      <defs>
        <clipPath id="hc-clip"><rect x={X0} y={Y0} width={X1 - X0 + 8} height={Y1 - Y0} /></clipPath>
        <linearGradient id="hc-shade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#276e59" stopOpacity=".18" />
          <stop offset="1" stopColor="#c9a646" stopOpacity=".12" />
        </linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => <line key={y} x1="36" x2="308" y1={y} y2={y} stroke="#e3e8df" />)}
      <line x1="36" y1={Y1} x2="308" y2={Y1} stroke="#9fb1a8" />
      <line x1="36" y1="14" x2="36" y2={Y1} stroke="#9fb1a8" />
      <g clipPath="url(#hc-clip)">
        <path ref={shade} fill="url(#hc-shade)" d="" />
        <g ref={d}>
          <line x1={XS} y1={A} x2={XS + xe} y2={A + M * xe} stroke="#276e59" strokeWidth="3.4" strokeLinecap="round" />
          <line x1={XS - 20} y1={A - M * 20} x2={XS} y2={A} stroke="#276e59" strokeWidth="3.4" strokeLinecap="round" />
        </g>
        <g ref={s}>
          <line x1={XS - 20} y1={B + M * 20} x2={XS + xe} y2={B - M * xe} stroke="#c9a646" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      </g>
      <line ref={vLine} x1="170" y1="110" x2="170" y2={Y1} stroke="#1f3832" strokeDasharray="4 4" />
      <line ref={hLine} x1="36" y1="110" x2="170" y2="110" stroke="#1f3832" strokeDasharray="4 4" />
      <circle ref={ring} cx="170" cy="110" r="14" fill="none" stroke="#276e59" strokeOpacity=".5" />
      <circle ref={dot} cx="170" cy="110" r="7" fill="#fff" stroke="#153a32" strokeWidth="3" />
      <text x="296" y={Y1 - 6} fontSize="12" fill="#276e59" fontWeight="700">D</text>
      <text x="296" y="34" fontSize="12" fill="#a8892f" fontWeight="700">S</text>
      <text ref={pText} x="20" y="114" fontSize="11" fill="#6f817a">P*</text>
      <text ref={qText} x="163" y="212" fontSize="11" fill="#6f817a">Q*</text>
    </svg>
  );
}
