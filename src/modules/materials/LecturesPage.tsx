import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

type Block =
  | { type: 'heading' | 'paragraph'; text: string }
  | { type: 'table'; rows: { text: string; span: number }[][] }
  | { type: 'image'; src: string };

const library = paths.materials + '?tur=maruzalar';
const assets = import.meta.env.BASE_URL + 'maruzalar/';

export function LecturesPage() {
  const [params] = useSearchParams();
  const topics = catalogService.getTopics().data;
  const topic = topics.find(item => String(item.globalOrder) === params.get('mavzu'));
  return <div className="container page">
    <PageHeader title={topic?.title ?? 'Ma’ruza matnlari'}
      eyebrow={topic ? topic.globalOrder + '-mavzu · Ma’ruza' : undefined}
      crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Ma’ruza matnlari', to: topic ? library : undefined }]}
      description={topic ? undefined : '25 mavzu bo‘yicha ma’ruza matnlari, jadvallar va chizmalar.'} />
    {topic ? <LectureReader key={topic.id} number={topic.globalOrder} /> :
      <div className="grid grid--3">
        {topics.map(item => <Link key={item.id} to={library + '&mavzu=' + item.globalOrder}
          className="card card--pad case-tile" onClick={() => window.scrollTo(0, 0)}>
          <span className="case-tile__number"><BookOpen size={17} aria-hidden /> {item.globalOrder}-mavzu</span>
          <strong>{item.title}</strong><ChevronRight size={18} aria-hidden />
        </Link>)}
      </div>}
  </div>;
}

function LectureReader({ number }: { number: number }) {
  const [blocks, setBlocks] = useState<Block[]>();
  const [failed, setFailed] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  useEffect(() => {
    const request = new AbortController();
    void fetch(assets + number + '.json', { signal: request.signal }).then(async response => {
      if (!response.ok) throw new Error('Lecture unavailable');
      setBlocks(await response.json());
    }).catch(() => { if (!request.signal.aborted) setFailed(true); });
    return () => request.abort();
  }, [number]);
  return <Card className="lecture-reader">
    <div className="presentation-actions lecture-reading-tools" role="group" aria-label="Matn kattaligi">
      <button type="button" className="btn btn--secondary" aria-label="Matnni kichraytirish" disabled={fontSize <= 14}
        onClick={() => setFontSize(size => size - 2)}>A−</button>
      <button type="button" className="btn btn--secondary" aria-label="Matnni kattalashtirish" disabled={fontSize >= 24}
        onClick={() => setFontSize(size => size + 2)}>A+</button>
      <span aria-live="polite">{fontSize} px</span>
    </div>
    {failed && <p role="alert">Ma’ruzani yuklab bo‘lmadi. Sahifani yangilang.</p>}
    {!failed && !blocks && <p role="status">Ma’ruza yuklanmoqda…</p>}
    <div style={{ fontSize }}>{blocks?.map((block, i) => {
      if (block.type === 'heading') return <h2 key={i}>{block.text}</h2>;
      if (block.type === 'image') return <img key={i} src={assets + block.src} alt="Ma’ruzadagi chizma" loading="lazy" />;
      if (block.type === 'table') return <div key={i} className="lecture-table-scroll" tabIndex={0} aria-label="Ma’ruza jadvali">
        <table><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => (
          <td key={cellIndex} colSpan={cell.span}>{cell.text}</td>
        ))}</tr>)}</tbody></table>
      </div>;
      return <p key={i}>{block.text}</p>;
    })}</div>
  </Card>;
}
