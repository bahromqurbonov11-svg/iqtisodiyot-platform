import { useEffect, useState } from 'react';
import { BookMarked, Eye } from 'lucide-react';
import { PageHeader, Button } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { PdfViewer } from './PdfViewer';

type Item = { title: string; author?: string; file: string };
const base = import.meta.env.BASE_URL;

/** Adabiyotlar: PDF hujjatlar faqat saytda ko‘riladi (yuklab olish yo‘q). */
export function LiteraturePage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState<Item | null>(null);
  useEffect(() => {
    fetch(base + 'adabiyotlar/index.json').then(r => r.json()).then(d => setItems(d.items ?? [])).catch(() => setItems([]));
  }, []);
  return (
    <div className="container page">
      <PageHeader title="Adabiyotlar" crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Adabiyotlar' }]}
        description="Darslik va qo‘shimcha adabiyotlar. Hujjatlar faqat saytda ko‘rish uchun ochiladi." />
      {!items && <p role="status">Yuklanmoqda…</p>}
      {items && items.length === 0 && <div className="slides-empty"><BookMarked size={22} aria-hidden /><div>
        <strong>Adabiyotlar hali yuklanmagan</strong>
        <p className="small muted">O‘qituvchi PDF fayllarni yuklagach, shu yerda ko‘rish mumkin bo‘ladi.</p></div></div>}
      {items && items.length > 0 && <ul className="files">
        {items.map(it => <li key={it.file} className="file">
          <span className="file__icon file__icon--pdf"><BookMarked size={20} aria-hidden /></span>
          <div className="file__main"><strong>{it.title}</strong>{it.author && <small className="muted">{it.author}</small>}</div>
          <div className="file__actions"><Button size="sm" icon={<Eye size={15} />} onClick={() => setOpen(it)}>Ko‘rish</Button></div>
        </li>)}
      </ul>}
      {open && <PdfViewer url={base + 'adabiyotlar/' + open.file} title={open.title} onClose={() => setOpen(null)} />}
    </div>
  );
}
