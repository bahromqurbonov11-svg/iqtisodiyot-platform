import { ChartNoAxesCombined } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/navigation/paths';
import schoolLogo from '../../soliq-oliy-maktabi-logo.png';

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span className="brand__mark" aria-hidden="true" style={{
      width: size, height: size, flexShrink: 0, display: 'grid', placeItems: 'center',
      borderRadius: 9, background: 'var(--c-primary-dark)', color: '#e3f3e9',
    }}>
      <ChartNoAxesCombined size={Math.round(size * 0.65)} strokeWidth={1.9} />
    </span>
  );
}

export function Brand({ compact = false, showSchool = false, to = paths.home }: {
  compact?: boolean; showSchool?: boolean; to?: string;
}) {
  return (
    <Link to={to} className="brand" aria-label={showSchool
      ? 'Soliq oliy maktabi · Iqtisodiyot nazariyasi — bosh sahifa'
      : 'Iqtisodiyot nazariyasi — bosh sahifa'}>
      {showSchool && (
        <span style={{ width: 'clamp(62px, 8vw, 104px)', aspectRatio: '2.15', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <img src={schoolLogo} alt="Soliq oliy maktabi" width={447} height={447} style={{
            position: 'absolute', width: '128%', height: 'auto', maxWidth: 'none', left: '-13%', top: '-87%',
          }} />
        </span>
      )}
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
