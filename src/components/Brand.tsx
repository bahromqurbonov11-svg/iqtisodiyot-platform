import { Link } from 'react-router-dom';
import { paths } from '@/navigation/paths';

/** Logotip belgisi: talab va taklif egri chiziqlari kesishmasi */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="brand__mark">
      <rect width="40" height="40" rx="10" fill="var(--c-primary-dark)" />
      <path d="M9 10 C 16 18, 22 24, 31 30" stroke="#dff1e5" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M9 30 C 17 23, 23 17, 31 10" stroke="var(--c-accent)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2.8" fill="#fff" />
    </svg>
  );
}

export function Brand({ compact = false, to = paths.home }: { compact?: boolean; to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="Iqtisodiyot nazariyasi — bosh sahifa">
      <BrandMark />
      {!compact && (
        <span className="brand__text">
          <strong>Iqtisodiyot nazariyasi</strong>
          <small>Ta’lim va analitika</small>
        </span>
      )}
    </Link>
  );
}
