const phases = [
  { label: 'O‘sish', value: 75, front: '#3c79b8', side: '#245889', top: '#a9d2f3' },
  { label: 'Cho‘qqi', value: 100, front: '#7958b3', side: '#523886', top: '#c8b7eb' },
  { label: 'Pasayish', value: 72, front: '#bf654f', side: '#914532', top: '#f2b8a7' },
  { label: 'Tub nuqta', value: 48, front: '#bd882d', side: '#875e1d', top: '#f6d48a' },
  { label: 'Tiklanish', value: 80, front: '#25897b', side: '#175e55', top: '#9bdbcd' },
];

export function EconomicCycleDiagram() {
  return (
    <figure className="economic-cycle">
      <figcaption><strong>Iqtisodiy sikl</strong></figcaption>
      <svg viewBox="0 0 420 232" className="economic-cycle__plot" role="img"
        aria-label={phases.map(({ label, value }) => label + ' ' + value).join(', ')}>
        <path d="M33 180H391L407 192H48Z" fill="#c5d8e2" />
        {[0, 50, 100].map(value => {
          const y = 180 - value * 1.35;
          return <g key={value} fill="#455b6a" fontSize="12">
            <line x1="33" x2="391" y1={y} y2={y} stroke="#a4bac8" strokeOpacity=".55" />
            <text x="28" y={y + 4} textAnchor="end">{value}</text>
          </g>;
        })}
        {phases.map(({ label, value, front, side, top }, index) => {
          const x = 49 + index * 72;
          const y = 180 - value * 1.35;
          return <g key={label}>
            <g className="economic-cycle__bar" style={{ animationDelay: index * 0.4 + 's' }}>
            <path d={`M${x} ${y}h35v${180 - y}h-35Z`} fill={front} />
            <path d={`M${x + 35} ${y}l12 -9V171l-12 9Z`} fill={side} />
            <path className="economic-cycle__cap" style={{ animationDelay: index * 0.4 + 's' }}
              d={`M${x} ${y}l12 -9h35l-12 9Z`} fill={top} />
            <text x={x + 21} y={y - 16} fill="#203849" fontSize="14" fontWeight="700" textAnchor="middle">{value}</text>
            </g>
            <text x={x + 21} y="212" fill="#334e60" fontSize="13" textAnchor="middle">{label}</text>
          </g>;
        })}
      </svg>
    </figure>
  );
}
