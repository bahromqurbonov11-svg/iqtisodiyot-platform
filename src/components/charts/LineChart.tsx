interface Series {
  name: string;
  values: number[];
}

interface Props {
  labels: string[];
  series: Series[];
  min?: number;
  max?: number;
  unit?: string;
  height?: number;
  ariaLabel: string;
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

/** Oddiy SVG chiziqli grafik (tashqi kutubxonasiz) */
export function LineChart({ labels, series, min = 0, max = 100, unit = '%', height = 240, ariaLabel }: Props) {
  const W = 640;
  const H = height;
  const pad = { l: 40, r: 16, t: 14, b: 30 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (i: number) => pad.l + (labels.length === 1 ? iw / 2 : (i * iw) / (labels.length - 1));
  const y = (v: number) => pad.t + ih - ((v - min) / (max - min)) * ih;
  const ticks = [min, min + (max - min) / 4, min + (max - min) / 2, min + ((max - min) * 3) / 4, max];

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} preserveAspectRatio="none" style={{ height }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="chart__grid" />
            <text x={pad.l - 8} y={y(t) + 4} className="chart__tick" textAnchor="end">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 8} className="chart__tick" textAnchor="middle">
            {l}
          </text>
        ))}
        {series.map((s, si) => {
          const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={3} fill="#fff" stroke={COLORS[si % COLORS.length]} strokeWidth={2} vectorEffect="non-scaling-stroke">
                  <title>{`${s.name}, ${labels[i]}: ${v}${unit}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption className="legend">
        {series.map((s, si) => (
          <span key={s.name} className="legend__item">
            <i style={{ background: COLORS[si % COLORS.length] }} />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
