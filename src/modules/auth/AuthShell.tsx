import type { ReactNode } from 'react';
import { Brand } from '@/components/Brand';

export function AuthShell({ title, subtitle, children, aside }: { title: string; subtitle: string; children: ReactNode; aside: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth__form-side">
        <div className="auth__form-wrap">
          <Brand />
          <h1 className="auth__title">{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </div>
      <div className="auth__aside">{aside}</div>
    </div>
  );
}
