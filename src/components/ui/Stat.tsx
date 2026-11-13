import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function StatCard({ label, value, hint, icon, tone = 'primary' }: StatCardProps) {
  return (
    <div className={`stat stat--${tone}`}>
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        {icon && <span className="stat__icon">{icon}</span>}
      </div>
      <div className="stat__value">{value}</div>
      {hint && <div className="stat__hint">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'primary', label }: { value: number | null; tone?: string; label?: string }) {
  if (value === null) {
    return (
      <div className="progress progress--empty" aria-label={label ?? 'Ma’lumot yetarli emas'}>
        <span className="progress__na">ma’lumot yo‘q</span>
      </div>
    );
  }
  const pct = Math.round(value * 100);
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={`progress__bar progress__bar--${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function toneFor(value: number | null): 'success' | 'warning' | 'danger' | 'neutral' {
  if (value === null) return 'neutral';
  if (value >= 0.75) return 'success';
  if (value >= 0.55) return 'warning';
  return 'danger';
}
