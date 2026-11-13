interface Row {
  label: string;
  cells: { key: string; value: number | null; title?: string }[];
}

/**
 * Issiqlik xaritasi: qatorlar (guruhlar) × ustunlar (mavzular).
 * null qiymat — "ma’lumot yetarli emas" (shtrixlangan katak), 0% EMAS.
 */
export function Heatmap({ columns, rows, ariaLabel }: { columns: string[]; rows: Row[]; ariaLabel: string }) {
  const color = (v: number | null) => {
    if (v === null) return undefined;
    if (v >= 0.75) return `rgba(39,110,89,${0.35 + (v - 0.75) * 2.4})`;
    if (v >= 0.55) return `rgba(201,166,70,${0.45 + (v - 0.55) * 2})`;
    return `rgba(192,69,58,${0.4 + (0.55 - v) * 1.5})`;
  };
  return (
    <div className="heatmap-wrap">
      <table className="heatmap" aria-label={ariaLabel}>
        <thead>
          <tr>
            <th scope="col" className="heatmap__corner">Guruh / Mavzu</th>
            {columns.map((c) => (
              <th key={c} scope="col">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              {r.cells.map((c) => (
                <td key={c.key} title={c.title}>
                  <span className={`heatmap__cell${c.value === null ? ' is-na' : ''}`} style={{ background: color(c.value) }}>
                    {c.value === null ? '' : Math.round(c.value * 100)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="legend heatmap__legend">
        <span className="legend__item"><i style={{ background: 'rgba(39,110,89,.7)' }} />≥75% o‘zlashtirilgan</span>
        <span className="legend__item"><i style={{ background: 'rgba(201,166,70,.7)' }} />55–74% rivojlanmoqda</span>
        <span className="legend__item"><i style={{ background: 'rgba(192,69,58,.6)' }} />&lt;55% bo‘shliq</span>
        <span className="legend__item"><i className="is-na" />ma’lumot yetarli emas (0 deb hisoblanmaydi)</span>
      </div>
    </div>
  );
}
