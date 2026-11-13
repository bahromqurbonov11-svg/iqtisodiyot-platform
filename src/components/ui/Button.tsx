import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'light';
type Size = 'sm' | 'md' | 'lg';

interface Common {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
  className?: string;
  block?: boolean;
}

type AsLink = Common & { to: string } & { title?: string };
type AsButton = Common & { to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', icon, iconRight, children, className = '', block } = props;
  const cls = `btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`.trim();
  const inner = (
    <>
      {icon}
      {children && <span>{children}</span>}
      {iconRight}
    </>
  );
  if (props.to !== undefined) {
    return (
      <Link to={props.to} className={cls} title={props.title}>
        {inner}
      </Link>
    );
  }
  const { variant: _v, size: _s, icon: _i, iconRight: _ir, block: _b, className: _c, children: _ch, ...rest } = props as AsButton;
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}
