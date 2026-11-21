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
  const [failed, setFailed] = useState(false);
  const [request, setRequest] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(base + 'adabiyotlar/index.json', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('Literature index unavailable');
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.items)) throw new Error('Invalid literature index');
        if (!controller.signal.aborted) setItems(data.items);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [request]);
  return (
    <div className="container page">
      <PageHeader title="Adabiyotlar" crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Adabiyotlar' }]}
        description="Darslik va qo‘shimcha adabiyotlar. Hujjatlar faqat saytda ko‘rish uchun ochiladi." />
      {!items && !failed && <p role="status">Yuklanmoqda…</p>}
      {failed && <div className="slides-empty" role="alert">
        <div><strong>Adabiyotlar ro‘yxati yuklanmadi</strong>
          <p className="small muted">Internet aloqasini tekshirib, qayta urinib ko‘ring.</p>
          <Button onClick={() => { setFailed(false); setRequest(value => value + 1); }}>Qayta urinish</Button>
        </div>
      </div>}
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
