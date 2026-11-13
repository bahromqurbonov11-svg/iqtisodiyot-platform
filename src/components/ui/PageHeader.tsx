import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  crumbs?: Crumb[];
  badges?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, crumbs, badges }: Props) {
  return (
    <div className="page-header">
      {crumbs && (
        <nav className="crumbs" aria-label="Yo‘l">
          {crumbs.map((c, i) => (
            <span key={i} className="crumbs__item">
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              {i < crumbs.length - 1 && <ChevronRight size={14} aria-hidden />}
            </span>
          ))}
        </nav>
      )}
      <div className="page-header__row">
        <div className="page-header__text">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {badges && <div className="page-header__badges">{badges}</div>}
          {description && <p className="page-header__desc">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </div>
  );
}
