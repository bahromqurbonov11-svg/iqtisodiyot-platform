import { useId, useState } from 'react';

const steps = Array.from({ length: 11 }, (_, index) => index);
const output = (labor: number, capital: number) => 10 * Math.sqrt(labor * capital);

function project(labor: number, capital: number, height = 0) {
  return [190 + (labor - capital) * 13, 125 + (labor + capital) * 5.5 - height * 1.7];
}

function point(labor: number, capital: number) {
  return project(labor, capital, output(labor, capital));
}

const cells = steps.slice(0, -1).flatMap(labor => steps.slice(0, -1).map(capital => ({
  labor, capital,
  corners: [point(labor, capital), point(labor + 1, capital), point(labor + 1, capital + 1), point(labor, capital + 1)].join(' '),
  color: 157 - output(labor + 0.5, capital + 0.5) * 0.38,
}))).sort((a, b) => a.labor + a.capital - b.labor - b.capital);

export function ProductionSurface() {
  const id = useId();
  const [labor, setLabor] = useState(6);
  const [capital, setCapital] = useState(4);
  const quantity = output(labor, capital);
  const [x, y] = point(labor, capital);
  const [, floorY] = project(labor, capital);

  return (
    <figure className="production-surface" aria-labelledby={id}>
      <figcaption id={id}><strong>Ishlab chiqarish yuzasi</strong><span>Q = 10√(L × K)</span></figcaption>
      <svg viewBox="0 0 380 252" className="production-surface__plot" aria-hidden="true">
        <polygon points={[project(0, 0), project(10, 0), project(10, 10), project(0, 10)].join(' ')} fill="#183f36" stroke="#699584" />
        {steps.map(i => (
          <g key={i} stroke="#a4cdbb" strokeOpacity=".24">
            <polyline points={[project(i, 0), project(i, 10)].join(' ')} />
            <polyline points={[project(0, i), project(10, i)].join(' ')} />
          </g>
        ))}
        <polyline points={[project(0, 0, 56), project(0, 0), project(10, 0)].join(' ')} fill="none" stroke="#a4cdbb" />
        {cells.map(({ labor, capital, corners, color }) => (
          <polygon key={labor * 10 + capital} points={corners} fill={`hsl(${color} 48% 43%)`} stroke="#d8f1d9" strokeOpacity=".58" strokeWidth=".7" />
        ))}
        <line x1={x} x2={x} y1={floorY} y2={y} stroke="#ffe8a3" strokeDasharray="4 4" />
        <circle className="production-surface__point" cx={x} cy={y} r="5" fill="#ffe8a3" stroke="#142e28" strokeWidth="2" />
        <g fill="#e1f1e8" fontSize="14" fontWeight="600">
          <text x="190" y="22" textAnchor="middle">Mahsulot (Q)</text>
          <text x="326" y="199" textAnchor="middle">Mehnat (L)</text>
          <text x="54" y="199" textAnchor="middle">Kapital (K)</text>
        </g>
      </svg>
      <div className="production-surface__controls">
        <label><span>Mehnat (L) <b>{labor}</b></span><input type="range" min="0" max="10" value={labor} onChange={event => setLabor(Number(event.target.value))} /></label>
        <label><span>Kapital (K) <b>{capital}</b></span><input type="range" min="0" max="10" value={capital} onChange={event => setCapital(Number(event.target.value))} /></label>
      </div>
      <div className="production-surface__result">
        <span>Modeldagi mahsulot hajmi</span>
        <output aria-live="polite">{quantity.toLocaleString('uz-UZ', { maximumFractionDigits: 1 })} birlik</output>
      </div>
    </figure>
  );
}
