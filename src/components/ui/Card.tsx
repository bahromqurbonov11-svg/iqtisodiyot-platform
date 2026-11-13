import type { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  padded?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function Card({ title, subtitle, actions, children, className = '', padded = true, as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={`card${padded ? ' card--pad' : ''} ${className}`.trim()}>
      {(title || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </Tag>
  );
}
