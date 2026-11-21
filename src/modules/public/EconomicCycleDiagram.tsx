const phases = [
  { label: 'O‘sish', value: 75 },
  { label: 'Cho‘qqi', value: 100 },
  { label: 'Pasayish', value: 72 },
  { label: 'Tub nuqta', value: 48 },
  { label: 'Tiklanish', value: 80 },
];

export function EconomicCycleDiagram() {
  return (
    <figure className="economic-cycle">
      <figcaption><strong>Iqtisodiy sikl</strong><span>Shartli ishlab chiqarish indeksi</span></figcaption>
      <svg viewBox="0 0 420 232" className="economic-cycle__plot" role="img"
        aria-label={phases.map(({ label, value }) => label + ' ' + value).join(', ')}>
        <path d="M33 180H391L407 192H48Z" fill="#26594c" />
        {[0, 50, 100].map(value => {
          const y = 180 - value * 1.35;
          return <g key={value} fill="#bedccf" fontSize="12">
            <line x1="33" x2="391" y1={y} y2={y} stroke="#88b3a3" strokeOpacity=".32" />
            <text x="28" y={y + 4} textAnchor="end">{value}</text>
          </g>;
        })}
        {phases.map(({ label, value }, index) => {
          const x = 49 + index * 72;
          const y = 180 - value * 1.35;
          return <g key={label}>
            <g className="economic-cycle__bar" style={{ animationDelay: index * 0.55 + 's' }}>
            <path d={`M${x} ${y}h35v${180 - y}h-35Z`} fill={index === 3 ? '#af8946' : '#48a78b'} />
            <path d={`M${x + 35} ${y}l12 -9V171l-12 9Z`} fill={index === 3 ? '#805c31' : '#25725f'} />
            <path className="economic-cycle__cap" style={{ animationDelay: index * 0.55 + 's' }}
              d={`M${x} ${y}l12 -9h35l-12 9Z`} fill={index === 3 ? '#f0cc85' : '#a5dfbf'} />
            </g>
            <text x={x + 21} y={y - 16} fill="#f4fff9" fontSize="14" fontWeight="700" textAnchor="middle">{value}</text>
            <text x={x + 21} y="212" fill="#e4f2ea" fontSize="13" textAnchor="middle">{label}</text>
          </g>;
        })}
      </svg>
    </figure>
  );
}
