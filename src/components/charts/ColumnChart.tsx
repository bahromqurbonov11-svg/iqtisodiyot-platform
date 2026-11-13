interface Col {
  label: string;
  value: number; // 0..1
  note?: string;
}

/** Vertikal ustunli grafik (masalan, ishonch darajasi bo‘yicha aniqlik) */
export function ColumnChart({ cols, ariaLabel, reference }: { cols: Col[]; ariaLabel: string; reference?: number[] }) {
  return (
    <div className="columns" role="img" aria-label={ariaLabel}>
      {cols.map((c, i) => (
        <div key={c.label} className="columns__col">
          <div className="columns__value">{Math.round(c.value * 100)}%</div>
          <div className="columns__track">
            {reference && <div className="columns__ref" style={{ bottom: `${reference[i] * 100}%` }} title="Ideal moslik" />}
            <div className="columns__fill" style={{ height: `${c.value * 100}%` }} title={c.note} />
          </div>
          <div className="columns__label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
