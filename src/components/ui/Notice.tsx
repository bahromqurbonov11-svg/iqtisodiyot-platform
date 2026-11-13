import type { ReactNode } from 'react';
import { FlaskConical, Info, Construction } from 'lucide-react';

type Kind = 'demo' | 'info' | 'stage';

export function Notice({ kind = 'info', title, children }: { kind?: Kind; title?: ReactNode; children?: ReactNode }) {
  const Icon = kind === 'demo' ? FlaskConical : kind === 'stage' ? Construction : Info;
  return (
    <div className={`notice notice--${kind}`} role="note">
      <Icon size={18} aria-hidden />
      <div>
        {title && <strong className="notice__title">{title}</strong>}
        {children && <div className="notice__body">{children}</div>}
      </div>
    </div>
  );
}

export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <Notice kind="demo" title="Namunaviy (DEMO) ma’lumotlar">
      {children ?? 'Bu sahifadagi raqamlar va ismlar to‘qima. Interfeys qanday ishlashini ko‘rsatish uchun berilgan. Haqiqiy natijalar talabalar testlarni topshira boshlagach paydo bo‘ladi.'}
    </Notice>
  );
}

export function StageNotice({ stage, children }: { stage: number; children?: ReactNode }) {
  return (
    <Notice kind="stage" title={`Bu funksiya ${stage}-bosqichda ishga tushadi`}>
      {children}
    </Notice>
  );
}
