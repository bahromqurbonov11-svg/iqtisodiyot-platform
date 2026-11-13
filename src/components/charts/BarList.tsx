import type { ReactNode } from 'react';

interface Item {
  key: string;
  label: ReactNode;
  value: number; // 0..1
  meta?: ReactNode;
}

/** Gorizontal ustunlar ro‘yxati — reyting va ulushlar uchun */
export function BarList({ items, tone = 'danger', format = (v: number) => `${Math.round(v * 100)}%` }: { items: Item[]; tone?: 'danger' | 'primary' | 'warning'; format?: (v: number) => string }) {
  const max = Math.max(...items.map((i) => i.value), 0.0001);
  return (
    <ul className="barlist">
      {items.map((it) => (
        <li key={it.key} className="barlist__row">
          <div className="barlist__head">
            <span className="barlist__label">{it.label}</span>
            <span className="barlist__value">{format(it.value)}</span>
          </div>
          <div className="barlist__track">
            <div className={`barlist__fill barlist__fill--${tone}`} style={{ width: `${(it.value / max) * 100}%` }} />
          </div>
          {it.meta && <div className="barlist__meta">{it.meta}</div>}
        </li>
      ))}
    </ul>
  );
}
