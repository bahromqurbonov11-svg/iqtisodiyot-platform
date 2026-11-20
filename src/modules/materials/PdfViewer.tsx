import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * Faqat ko‘rish uchun PDF ko‘rgich: sahifalar canvas sifatida chiziladi,
 * yuklab olish/chop etish tugmasi yo‘q, o‘ng tugma menyusi o‘chirilgan.
 * Eslatma: brauzerda to‘liq himoya mumkin emas — bu faqat oddiy foydalanuvchi uchun to‘siq.
 */
export function PdfViewer({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pages, setPages] = useState(0);

  useEffect(() => {
    let active = true;
    let doc: { destroy: () => Promise<void> } | undefined;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
        pdfjs.GlobalWorkerOptions.workerSrc = worker;
        const pdf = await pdfjs.getDocument({ url }).promise;
        doc = pdf;
        if (!active || !host.current) return;
        setPages(pdf.numPages);
        setStatus('ready');
        const width = Math.min(host.current.clientWidth || 360, 900);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
          if (!active || !host.current) return;
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.className = 'pdf-page';
          canvas.setAttribute('aria-label', n + '-sahifa');
          host.current.appendChild(canvas);
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
        }
      } catch {
        if (active) setStatus('error');
      }
    })();
    return () => { active = false; void doc?.destroy(); };
  }, [url]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return createPortal(
    <div className="pdfv" role="dialog" aria-modal="true" aria-label={title} onContextMenu={e => e.preventDefault()}>
      <div className="pdfv__bar">
        <strong>{title}</strong>
        <span className="small muted">{pages > 0 ? pages + ' sahifa · faqat ko‘rish' : 'faqat ko‘rish'}</span>
        <Button variant="ghost" onClick={onClose} icon={<X size={16} />}>Yopish</Button>
      </div>
      <div className="pdfv__scroll">
        <div ref={host} className="pdfv__pages" />
        {status === 'loading' && <p role="status" className="center">PDF yuklanmoqda…</p>}
        {status === 'error' && <p role="alert" className="center">Hujjatni ochib bo‘lmadi.</p>}
      </div>
    </div>,
    document.body,
  );
}
