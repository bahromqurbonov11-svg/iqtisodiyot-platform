/**
 * O‘yin kartalaridagi illyustratsiyalar: qatlamli manzara, gradient, soya va hajm.
 * Harakatlanuvchi qismlar CSS bilan jonlantiriladi (src/styles/v3.css, "scene-" sinflari).
 */
export function GameScene({ slug }: { slug: string }) {
  return (
    <svg className={'scene scene--' + slug} viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={'sky-' + slug} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd3ff" /><stop offset="1" stopColor="#eaf8ff" />
        </linearGradient>
        <linearGradient id={'grass-' + slug} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fbf73" /><stop offset="1" stopColor="#2f7d4f" />
        </linearGradient>
        <radialGradient id={'ring-' + slug}>
          <stop offset="0" stopColor="#fff6d8" /><stop offset="1" stopColor="#f0b84a" />
        </radialGradient>
        <linearGradient id={'wood-' + slug} x1="0" x2="1">
          <stop offset="0" stopColor="#b8794a" /><stop offset="1" stopColor="#7d4a28" />
        </linearGradient>
      </defs>

      {slug === 'mergan' && <>
        <rect width="320" height="150" fill={'url(#sky-' + slug + ')'} />
        <circle className="scene-sun" cx="266" cy="34" r="18" fill="#ffe08a" />
        <path d="M0 100 Q60 62 130 96 T270 90 T340 96 V150 H0Z" fill="#9bd39d" />
        <path d="M0 112 Q90 84 180 110 T340 104 V150 H0Z" fill={'url(#grass-' + slug + ')'} />
        <ellipse cx="160" cy="124" rx="70" ry="7" fill="#1d4d34" opacity=".25" />
        <rect x="154" y="86" width="12" height="40" rx="3" fill={'url(#wood-' + slug + ')'} />
        <g className="scene-target">
          <circle cx="160" cy="62" r="40" fill="#fff" stroke="#c9553b" strokeWidth="2" />
          <circle cx="160" cy="62" r="31" fill="#e0533c" />
          <circle cx="160" cy="62" r="22" fill="#fff" />
          <circle cx="160" cy="62" r="14" fill="#e0533c" />
          <circle cx="160" cy="62" r="6" fill={'url(#ring-' + slug + ')'} />
          <path className="scene-arrow" d="M96 108 L160 62" stroke="#6b4423" strokeWidth="3" strokeLinecap="round" />
          <path className="scene-arrow" d="M96 108 l7 -2 l-3 7z" fill="#c8c8c8" />
        </g>
      </>}

      {slug === 'grafikni-boshqar' && <>
        <rect width="320" height="150" fill="#eaf1ff" />
        <rect x="14" y="12" width="292" height="126" rx="12" fill="#fff" stroke="#c7d6f5" />
        {[40, 66, 92, 118].map((y) => <line key={y} x1="30" x2="294" y1={y} y2={y} stroke="#e4ebfa" />)}
        <path d="M30 20 V122 H296" fill="none" stroke="#6c86c4" strokeWidth="2" />
        <g className="scene-line scene-line--d"><path d="M40 34 L280 108" stroke="#2f6bd6" strokeWidth="5" strokeLinecap="round" /></g>
        <g className="scene-line scene-line--s"><path d="M40 108 L280 36" stroke="#e8765a" strokeWidth="5" strokeLinecap="round" /></g>
        <circle className="scene-dot" cx="160" cy="72" r="9" fill="#fff" stroke="#173b8a" strokeWidth="4" />
        <circle className="scene-pulse" cx="160" cy="72" r="9" fill="none" stroke="#2f6bd6" strokeWidth="2" />
      </>}

      {slug === 'marraga-yugurish' && <>
        <rect width="320" height="150" fill={'url(#sky-' + slug + ')'} />
        <circle className="scene-sun" cx="52" cy="34" r="18" fill="#ffe08a" />
        <g className="scene-cloud"><ellipse cx="200" cy="30" rx="28" ry="9" fill="#fff" /><ellipse cx="216" cy="24" rx="18" ry="9" fill="#fff" /></g>
        <path d="M0 92 Q70 56 150 90 T320 80 V150 H0Z" fill="#a9d8ac" />
        <rect y="104" width="320" height="46" fill="#c98a52" />
        <rect y="104" width="320" height="6" fill="#e0a56e" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} className="scene-lane" x={i * 54} y="124" width="30" height="3" rx="1.5" fill="#fff" opacity=".8" />)}
        <g><rect x="276" y="52" width="3" height="56" fill="#5b4636" /><path className="scene-flag" d="M279 54 h30 l-8 9 l8 9 h-30z" fill="#e0533c" /></g>
        <g className="scene-hurdle"><rect x="190" y="88" width="4" height="22" fill="#7d4a28" /><rect x="182" y="86" width="40" height="6" rx="2" fill="#fff" stroke="#c9553b" /><rect x="218" y="88" width="4" height="22" fill="#7d4a28" /></g>
        <g className="scene-runner">
          <ellipse cx="86" cy="112" rx="14" ry="3.5" fill="#000" opacity=".22" />
          <circle cx="88" cy="68" r="8" fill="#f2c18d" />
          <path d="M80 62 q8 -10 16 0" fill="#3a2a1d" />
          <path d="M88 76 L84 96" stroke="#1b5f4d" strokeWidth="9" strokeLinecap="round" />
          <path className="scene-leg scene-leg--a" d="M84 96 L96 112" stroke="#25344d" strokeWidth="6" strokeLinecap="round" />
          <path className="scene-leg scene-leg--b" d="M84 96 L74 112" stroke="#25344d" strokeWidth="6" strokeLinecap="round" />
          <path d="M86 80 L98 88" stroke="#f2c18d" strokeWidth="5" strokeLinecap="round" />
        </g>
      </>}

      {slug === 'moslashtirish' && <>
        <rect width="320" height="150" fill="#e4f6f2" />
        {[0, 1, 2].map((i) => (
          <g key={i} className={'scene-card scene-card--' + i}>
            <rect x="26" y={20 + i * 38} width="96" height="30" rx="8" fill="#fff" stroke="#9fd6cb" />
            <rect x="36" y={31 + i * 38} width="52" height="6" rx="3" fill="#1f9e8f" />
            <rect x="198" y={20 + i * 38} width="96" height="30" rx="8" fill="#fff" stroke="#9fd6cb" />
            <rect x="208" y={31 + i * 38} width="62" height="6" rx="3" fill="#7bc9bd" />
          </g>
        ))}
        {[0, 1, 2].map((i) => <path key={i} className="scene-link" d={'M122 ' + (35 + i * 38) + ' C 160 ' + (35 + i * 38) + ', 160 ' + (35 + ((i + 1) % 3) * 38) + ', 198 ' + (35 + ((i + 1) % 3) * 38)} fill="none" stroke="#1f9e8f" strokeWidth="3" strokeLinecap="round" />)}
      </>}

      {slug === 'vaziyatli-qaror' && <>
        <rect width="320" height="150" fill="#efe9ff" />
        <circle className="scene-bulb" cx="160" cy="48" r="26" fill="#ffe08a" />
        <path d="M148 70 h24 v10 a6 6 0 0 1 -6 6 h-12 a6 6 0 0 1 -6 -6z" fill="#8d73d8" />
        {[[70, 110], [160, 118], [250, 110]].map(([x, y], i) => (
          <g key={i} className={'scene-node scene-node--' + i}>
            <path d={'M160 86 L' + x + ' ' + (y - 14)} stroke="#b8a6ec" strokeWidth="3" strokeDasharray="5 5" />
            <rect x={x - 34} y={y - 14} width="68" height="28" rx="10" fill="#fff" stroke="#b8a6ec" />
            <rect x={x - 22} y={y - 3} width="44" height="6" rx="3" fill="#7a5ccf" />
          </g>
        ))}
      </>}
    </svg>
  );
}
