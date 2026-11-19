import { useState } from 'react';
import { RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * INTERAKTIV MINI-LABORATORIYA: talab va taklif siljiganda bozor muvozanati qanday o‘zgaradi.
 * Bu o‘quv namunasi (soddalashtirilgan chiziqli model), haqiqiy bozor ma’lumoti emas.
 * Natijalar saqlanmaydi va talaba baholanmaydi.
 *
 * Model:  Talab  P = 90 + d − Q      Taklif  P = 10 − s + Q
 *         Muvozanat: Q* = (80 + d + s) / 2,  P* = 50 + (d − s) / 2
 */

const X0 = 44, X1 = 336, Y0 = 18, Y1 = 196; // chizma maydoni (SVG birligi)
const sx = (q: number) => X0 + ((X1 - X0) * q) / 100;
const sy = (p: number) => Y1 - ((Y1 - Y0) * p) / 100;
const K = (Y1 - Y0) / 100; // 1 narx birligi = K piksel

function describe(dP: number, dQ: number, d: number, s: number) {
  if (d === 0 && s === 0) return 'Boshlang‘ich holat: talab va taklif muvozanatda. Slayderlarni suring.';
  const q = dQ > 0 ? 'ortdi' : dQ < 0 ? 'kamaydi' : 'o‘zgarmadi';
  const p = dP > 0 ? 'oshdi' : dP < 0 ? 'pasaydi' : 'o‘zgarmadi';
  const cause =
    d !== 0 && s === 0 ? (d > 0 ? 'Talab ortdi' : 'Talab kamaydi')
    : d === 0 ? (s > 0 ? 'Taklif ortdi' : 'Taklif kamaydi')
    : 'Talab ham, taklif ham siljidi';
  return `${cause}: muvozanat miqdor ${q}, narx ${p}.`;
}

export function MarketPlayground() {
  const [d, setD] = useState(0);
  const [s, setS] = useState(0);
  const Q = Math.max(0, (80 + d + s) / 2);
  const P = 50 + (d - s) / 2;
  const dP = P - 50;
  const dQ = Q - 40;
  const moved = d !== 0 || s !== 0;

  const preset = (nd: number, ns: number) => { setD(nd); setS(ns); };

  return (
    <div className="playground">
      <div className="playground__chart">
        <svg viewBox="0 0 360 232" role="img" aria-label={`Talab va taklif grafigi. Muvozanat narx ${P.toFixed(0)}, miqdor ${Q.toFixed(0)}.`}>
          <defs>
            <clipPath id="pg-clip"><rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} /></clipPath>
          </defs>
          {[25, 50, 75, 100].map((p) => <line key={p} x1={X0} x2={X1} y1={sy(p)} y2={sy(p)} stroke="#e3e8df" />)}
          <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="#9fb1a8" />
          <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="#9fb1a8" />
          <text x={X0 - 8} y={Y0 + 4} fontSize="11" fill="#6f817a" textAnchor="end">P</text>
          <text x={X1 - 2} y={Y1 + 16} fontSize="11" fill="#6f817a" textAnchor="end">Q</text>

          {/* Boshlang‘ich muvozanat (iz) */}
          {moved && <circle cx={sx(40)} cy={sy(50)} r="5" fill="none" stroke="#9fb1a8" strokeDasharray="3 3" />}

          <g clipPath="url(#pg-clip)">
            {/* Talab: P = 90 − Q, d ga qarab vertikal suriladi */}
            <g className="pg-line" style={{ transform: `translateY(${-d * K}px)` }}>
              <line x1={sx(0)} y1={sy(90)} x2={sx(100)} y2={sy(-10)} stroke="var(--c-primary)" strokeWidth="3.2" strokeLinecap="round" />
            </g>
            {/* Taklif: P = 10 − s + Q */}
            <g className="pg-line" style={{ transform: `translateY(${s * K}px)` }}>
              <line x1={sx(0)} y1={sy(10)} x2={sx(100)} y2={sy(110)} stroke="#a8892f" strokeWidth="3.2" strokeLinecap="round" />
            </g>
          </g>

          {/* Muvozanat yo‘naltiruvchilari */}
          <line className="pg-move" x1={sx(Q)} x2={sx(Q)} y1={sy(P)} y2={Y1} stroke="#1f3832" strokeDasharray="4 4" />
          <line className="pg-move" x1={X0} x2={sx(Q)} y1={sy(P)} y2={sy(P)} stroke="#1f3832" strokeDasharray="4 4" />
          <circle className="pg-move" cx={sx(Q)} cy={sy(P)} r="7" fill="#fff" stroke="#153a32" strokeWidth="3" />
          <text className="pg-move" x={sx(Q)} y={Y1 + 16} fontSize="11" fill="#153a32" textAnchor="middle" fontWeight="700">Q*</text>
          <text className="pg-move" x={X0 - 8} y={sy(P) + 4} fontSize="11" fill="#153a32" textAnchor="end" fontWeight="700">P*</text>

          <text x={sx(6)} y={Y0 + 12} fontSize="12" fill="var(--c-primary)" fontWeight="700">D</text>
          <text x={sx(94)} y={Y0 + 12} fontSize="12" fill="#a8892f" fontWeight="700">S</text>
        </svg>
      </div>

      <div className="playground__panel">
        <div className="playground__sliders">
          <label className="slider">
            <span className="slider__label"><b style={{ color: 'var(--c-primary)' }}>Talab</b> (D) siljishi <output>{d > 0 ? '+' : ''}{d}</output></span>
            <input type="range" min={-30} max={30} step={5} value={d} onChange={(e) => setD(Number(e.target.value))} aria-label="Talab siljishi" />
          </label>
          <label className="slider">
            <span className="slider__label"><b style={{ color: '#a8892f' }}>Taklif</b> (S) siljishi <output>{s > 0 ? '+' : ''}{s}</output></span>
            <input type="range" min={-30} max={30} step={5} value={s} onChange={(e) => setS(Number(e.target.value))} aria-label="Taklif siljishi" />
          </label>
        </div>

        <div className="playground__presets" role="group" aria-label="Tayyor holatlar">
          <button type="button" onClick={() => preset(20, 0)}>Talab oshdi</button>
          <button type="button" onClick={() => preset(0, 20)}>Taklif oshdi</button>
          <button type="button" onClick={() => preset(-20, 0)}>Talab kamaydi</button>
          <button type="button" onClick={() => preset(0, 0)} className="is-reset"><RotateCcw size={13} /> Boshidan</button>
        </div>

        <div className="playground__result" aria-live="polite">
          <div className="metric">
            <span>Muvozanat narx (P*)</span>
            <strong>{P.toFixed(0)} {dP > 0 ? <TrendingUp size={16} className="up" /> : dP < 0 ? <TrendingDown size={16} className="down" /> : null}</strong>
          </div>
          <div className="metric">
            <span>Muvozanat miqdor (Q*)</span>
            <strong>{Q.toFixed(0)} {dQ > 0 ? <TrendingUp size={16} className="up" /> : dQ < 0 ? <TrendingDown size={16} className="down" /> : null}</strong>
          </div>
        </div>
        <p className="playground__note">{describe(dP, dQ, d, s)}</p>
        <p className="playground__demo">O‘quv namunasi: soddalashtirilgan chiziqli model, haqiqiy bozor ma’lumoti emas.</p>
      </div>
    </div>
  );
}
