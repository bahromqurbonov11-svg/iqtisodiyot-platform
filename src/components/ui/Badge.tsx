import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import type { AccountStatus, MasteryLevel } from '@/models';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'demo' | 'accent';

export function Badge({ tone = 'neutral', children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`badge badge--${tone}`}>
      {icon}
      {children}
    </span>
  );
}

/** Namunaviy ma’lumotlar uchun majburiy yorliq */
export function DemoBadge({ label = 'DEMO' }: { label?: string }) {
  return (
    <span className="badge badge--demo" title="Namunaviy ma’lumot — haqiqiy natija emas">
      <FlaskConical size={12} aria-hidden />
      {label}
    </span>
  );
}

export function StageBadge(_: { stage: number }) { return null; }

const statusMap: Record<AccountStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Kutilmoqda', tone: 'warning' },
  approved: { label: 'Tasdiqlangan', tone: 'success' },
  rejected: { label: 'Rad etilgan', tone: 'danger' },
  blocked: { label: 'Bloklangan', tone: 'neutral' },
};

export function StatusBadge({ status }: { status: AccountStatus }) {
  const s = statusMap[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const masteryMap: Record<MasteryLevel, { label: string; tone: Tone }> = {
  mastered: { label: 'O‘zlashtirilgan', tone: 'success' },
  developing: { label: 'Rivojlanmoqda', tone: 'warning' },
  gap: { label: 'Bo‘shliq', tone: 'danger' },
  insufficient_data: { label: 'Ma’lumot yetarli emas', tone: 'neutral' },
};

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  const m = masteryMap[level];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
