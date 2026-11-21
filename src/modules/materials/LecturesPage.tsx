import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { TopicAccessNotice, useTopicAccess } from '@/services/TopicAccess';
import { paths } from '@/navigation/paths';
import { loadTopicContent } from './topicContent';

type Block =
  | { type: 'heading' | 'paragraph'; text: string }
  | { type: 'table'; rows: { text: string; span: number }[][] }
  | { type: 'image'; src: string };

const library = paths.materials + '?tur=maruzalar';

export function LecturesPage() {
  const access = useTopicAccess();
  const [params] = useSearchParams();
  const topics = catalogService.getTopics().data;
  const topic = topics.find(item => String(item.globalOrder) === params.get('mavzu'));
  if (topic && !access.allows(topic.globalOrder)) {
    return <TopicAccessNotice pending={access.maximum === null} failed={access.failed} />;
  }
  return <div className="container page">
    <PageHeader title={topic?.title ?? 'Ma’ruza matnlari'}
      eyebrow={topic ? topic.globalOrder + '-mavzu · Ma’ruza' : undefined}
      crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Ma’ruza matnlari', to: topic ? library : undefined }]}
      description={topic ? undefined : '25 mavzu bo‘yicha ma’ruza matnlari, jadvallar va chizmalar.'} />
    {topic ? <LectureReader key={topic.id} number={topic.globalOrder} /> :
      <div className="grid grid--3">
        {topics.map(item => {
          const heading = <><span className="case-tile__number"><BookOpen size={17} aria-hidden /> {item.globalOrder}-mavzu</span>
            <strong>{item.title}</strong></>;
          return access.allows(item.globalOrder)
            ? <Link key={item.id} to={library + '&mavzu=' + item.globalOrder} className="card card--pad case-tile"
                onClick={() => window.scrollTo(0, 0)}>{heading}<ChevronRight size={18} aria-hidden /></Link>
            : <div key={item.id} className="card card--pad case-tile">{heading}<span className="small muted">Yopiq</span></div>;
        })}
      </div>}
  </div>;
}

function LectureReader({ number }: { number: number }) {
  const [blocks, setBlocks] = useState<Block[]>();
  const [failed, setFailed] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  useEffect(() => {
    let active = true;
    const images: string[] = [];
    void loadTopicContent(number).then(async zip => {
      const file = zip.file('lecture.json');
      if (!file) throw new Error('Lecture unavailable');
      const content = JSON.parse(await file.async('string')) as Block[];
      const prepared = await Promise.all(content.map(async block => {
        if (block.type !== 'image') return block;
        const image = zip.file(block.src);
        if (!image) throw new Error('Lecture image unavailable');
        const blob = await image.async('blob');
        if (!active) return block;
        const src = URL.createObjectURL(new Blob([blob], { type: 'image/png' }));
        images.push(src);
        return { ...block, src };
      }));
      if (active) setBlocks(prepared);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; images.forEach(src => URL.revokeObjectURL(src)); };
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
      if (block.type === 'image') return <img key={i} src={block.src} alt="Ma’ruzadagi chizma" loading="lazy" />;
      if (block.type === 'table') return <div key={i} className="lecture-table-scroll" tabIndex={0} aria-label="Ma’ruza jadvali">
        <table><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => (
          <td key={cellIndex} colSpan={cell.span}>{cell.text}</td>
        ))}</tr>)}</tbody></table>
      </div>;
      return <p key={i}>{block.text}</p>;
    })}</div>
  </Card>;
}
