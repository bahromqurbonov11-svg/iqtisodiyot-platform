import { useEffect, useState, type CSSProperties } from 'react';
import { FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { MaterialCategory } from '@/data/materials';
import { loadResearchLink } from '@/services/researchLink';

export function ResearchTile({ category }: { category: MaterialCategory }) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('Yuklanmoqda…');

  useEffect(() => {
    let active = true;
    void loadResearchLink().then(result => {
      if (!active) return;
      setUrl(result.url);
      setStatus(result.error ? 'Havolani yuklab bo‘lmadi' : 'Havola hali qo‘shilmagan');
    });
    return () => { active = false; };
  }, []);

  const className = 'card card--pad cat-card';
  const style = { color: 'inherit', '--gc': 'var(--g-blue)' } as CSSProperties;
  const content = <>
    <span className="cat-card__icon"><FlaskConical size={22} aria-hidden /></span>
    <strong>{category.title}</strong>
    <span className="small muted" style={{ flex: 1 }}>{category.description}</span>
    <span className="cat-card__foot"><Badge tone={url ? 'success' : 'info'}>{url ? 'Yangi varaqda ochish' : status}</Badge></span>
  </>;

  return url
    ? <a className={className} href={url} target="_blank" rel="noopener noreferrer" style={style}>{content}</a>
    : <div className={className} style={style}>{content}</div>;
}
