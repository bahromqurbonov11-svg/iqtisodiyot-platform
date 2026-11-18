import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Download, ClipboardCheck, Gamepad2, Lightbulb, Clock, Network,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, StageBadge } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { references } from '@/data/subject';
import { games } from '@/data/games';
import { paths } from '@/navigation/paths';
import { NotFoundPage } from '@/modules/public/NotFoundPage';
import { GameIcon } from '@/modules/games/GameIcon';
import { SlidesList } from '@/modules/materials/SlidesList';
import { materialsService } from '@/services/materials.service';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/services/auth/AuthContext';

/**
 * MAVZU SAHIFASI SHABLONI — barcha 25 mavzu uchun bitta komponent.
 * Mazmun bloklari 2-bosqichda (materiallar, tushunchalar) to‘ldiriladi.
 */
export function TopicDetailPage() {
  const { topicId = '' } = useParams();
  const topic = catalogService.getTopic(topicId);
  if (!topic) return <NotFoundPage />;

  const part = catalogService.getSubject().data.parts.find((p) => p.id === topic.partId)!;
  const siblings = catalogService.getTopics(topic.partId).data;
  const { prev, next } = catalogService.getAdjacent(topic.id);
  const slideCount = materialsService.list(topic.id).data.length;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[
          { label: 'Mavzular', to: paths.topics },
          { label: part.title, to: `${paths.topics}?qism=${part.id}` },
          { label: `${topic.order}-mavzu` },
        ]}
        eyebrow={`${part.title} · ${topic.order}-mavzu · umumiy tartib ${topic.globalOrder}/25`}
        title={topic.title}
        badges={
          <>
            <Badge tone="neutral" icon={<Clock size={12} />}>Ma’ruza {topic.lectureHours} soat</Badge>
            <Badge tone="neutral" icon={<Clock size={12} />}>Amaliy {topic.practiceHours} soat</Badge>
            <Badge tone="primary">Manba: {topic.source.document}</Badge>
          </>
        }
      />

      <div className="topic-layout">
        <div className="stack">
          <Card title="Mavzu rejasi" subtitle="Sillabusdagi asosiy masalalar">
            <ol className="plan">
              {topic.subtopics.map((s, i) => (
                <li key={s}><span>{i + 1}</span>{s}</li>
              ))}
            </ol>
          </Card>

          <Card
            title="Taqdimotlar"
            subtitle="Ma’ruza slaydlari — ko‘rish va yuklab olish"
            actions={slideCount > 0 ? <Badge tone="success">{slideCount} ta fayl</Badge> : undefined}
          >
            <SlidesList topicId={topic.id} />
          </Card>

          <UploadedMaterials topicId={topic.id} topicTitle={topic.title} />

          <Card title="Asosiy tushunchalar" actions={<StageBadge stage={2} />}>
            <div className="placeholder">
              <Network size={22} aria-hidden />
              <p>
                Bu yerda mavzuning tushunchalari va ular orasidagi bog‘liqlik ko‘rsatiladi. Tushunchalar ro‘yxati ma’ruza matnlari va
                glossariy asosida tuziladi — testlar va o‘yinlar aynan shu tushunchalarga bog‘lanadi.
              </p>
            </div>
          </Card>

          <div className="grid grid--2">
            <Card title="Diagnostik test" actions={<StageBadge stage={4} />}>
              <p className="small muted">Har bir savol mavzu tushunchasiga va ehtimoliy xato turiga bog‘lanadi.</p>
              <Button to={paths.test(`test-${topic.id}`)} variant="secondary" icon={<ClipboardCheck size={16} />} className="mt-3">
                Test sahifasi
              </Button>
            </Card>
            <Card title="O‘yinlar" actions={<StageBadge stage={5} />}>
              <div className="game-mini-list">
                {games.slice(0, 3).map((g) => (
                  <Link key={g.slug} to={paths.game(g.slug)} className="game-mini" style={{ ['--gc' as string]: g.color }}>
                    <GameIcon name={g.icon} size={16} /> {g.title}
                  </Link>
                ))}
              </div>
              <Link to={paths.games} className="link small mt-3 inline-flex"><Gamepad2 size={14} /> Barcha o‘yinlar</Link>
            </Card>
          </div>

          <Card title="Adabiyotlar" subtitle="Sillabusda shu mavzu uchun ko‘rsatilgan manbalar">
            <ol className="refs">
              {topic.references.map((n) => (
                <li key={n}><span className="refs__n">[{n}]</span> {references[n]}</li>
              ))}
            </ol>
          </Card>

          <div className="pager">
            {prev ? (
              <Link to={paths.topic(prev.id)} className="pager__link">
                <ArrowLeft size={16} />
                <span><small>Oldingi mavzu</small>{prev.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link to={paths.topic(next.id)} className="pager__link pager__link--next">
                <span><small>Keyingi mavzu</small>{next.title}</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        <aside className="topic-aside">
          <Card padded={false}>
            <div className="topic-aside__head">{part.title}</div>
            <ol className="topic-aside__list">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link to={paths.topic(s.id)} className={s.id === topic.id ? 'is-active' : ''} aria-current={s.id === topic.id ? 'page' : undefined}>
                    <span className="num">{s.order}</span>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="tip">
            <Lightbulb size={18} aria-hidden />
            <p className="small">Kelajakda bu yerda sizning shu mavzu bo‘yicha natijangiz va tavsiyalar ko‘rinadi.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

const materialLabels: Record<string, string> = {
  slides: 'Taqdimot',
  lecture: 'Ma’ruza',
  glossary: 'Glossariy',
  case: 'Keys / amaliy topshiriq',
};

type UploadedMaterial = {
  id: string;
  title: string;
  description: string | null;
  material_kind: string | null;
  file_name: string;
  file_path: string;
};

function UploadedMaterials({ topicId, topicTitle }: { topicId: string; topicTitle: string }) {
  const { user } = useAuth();

  return (
    <Card title="Yuklangan o‘quv materiallari">
      {user ? (
        <MaterialFiles key={topicId + ':' + user.id} topicId={topicId} topicTitle={topicTitle} />
      ) : (
        <Button to="/kirish" variant="secondary">Materiallarni ko‘rish uchun kiring</Button>
      )}
    </Card>
  );
}

function MaterialFiles({ topicId, topicTitle }: { topicId: string; topicTitle: string }) {
  const [files, setFiles] = useState<UploadedMaterial[] | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<UploadedMaterial | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data, error: loadError } = await supabase
          .from('learning_resources')
          .select('id,title,description,material_kind,file_name,file_path')
          .in('topic_name', [topicId, topicTitle])
          .order('created_at', { ascending: false });
        if (loadError) throw loadError;
        if (active) setFiles(data ?? []);
      } catch {
        if (active) setError('Materiallar ro‘yxatini yuklab bo‘lmadi.');
      }
    }

    void load();
    return () => { active = false; };
  }, [topicId, topicTitle]);

  async function download(file: UploadedMaterial) {
    setError('');
    setDownloading(file.id);

    try {
      const { data, error: downloadError } = await supabase.storage
        .from('learning-resources')
        .createSignedUrl(file.file_path, 60, { download: file.file_name });
      if (downloadError || !data?.signedUrl) throw new Error('Download unavailable');

      const link = document.createElement('a');
      link.href = data.signedUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Faylni yuklab bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {!files && !error && <p role="status">Materiallar yuklanmoqda…</p>}
      {files?.length === 0 && <p className="muted">Bu mavzuga material yuklanmagan.</p>}
      {files && files.length > 0 && (
        <ul className="stack">
          {files.map((file) => (
            <li key={file.id} className="slot">
              <div>
                <strong>{file.title}</strong>
                <small className="muted">{(file.material_kind && materialLabels[file.material_kind]) || 'O‘quv materiali'}</small>
                {file.description && <p className="small">{file.description}</p>}
              </div>
              <div className="presentation-actions">
                {/\.pptx$/i.test(file.file_name) && (
                  <Button variant="secondary" onClick={() => setPresentation(file)}>Slaydlarni ko‘rish</Button>
                )}
                <Button variant="secondary" disabled={downloading !== null} icon={<Download size={16} />} onClick={() => void download(file)}>
                  {downloading === file.id ? 'Yuklanmoqda…' : 'Yuklab olish'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {presentation && <PresentationViewer file={presentation} onClose={() => setPresentation(null)} />}
    </>
  );
}

type Presentation = Awaited<ReturnType<typeof import('@pagus-kit/core').parse>>;
type SlideRenderer = typeof import('@pagus-kit/renderer').renderSlide;

function PresentationViewer({ file, onClose }: { file: UploadedMaterial; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [deck, setDeck] = useState<{ presentation: Presentation; renderSlide: SlideRenderer } | null>(null);
  const [slide, setSlide] = useState(0);
  const [image, setImage] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    let active = true;

    async function open() {
      try {
        const [result, { parse }, { renderSlide }] = await Promise.all([
          supabase.storage.from('learning-resources').download(file.file_path),
          import('@pagus-kit/core'),
          import('@pagus-kit/renderer'),
        ]);
        if (result.error || !result.data) throw new Error('Presentation unavailable');
        const presentation = await parse(await result.data.arrayBuffer());
        if (presentation.slides.length === 0) throw new Error('Presentation is empty');
        if (active) setDeck({ presentation, renderSlide });
      } catch {
        if (active) setError('Taqdimotni ochib bo‘lmadi. Faylni yuklab olib ko‘ring.');
      }
    }

    void open();
    return () => { active = false; };
  }, [file.file_path]);

  useEffect(() => {
    if (!deck) return;
    try {
      const { svg } = deck.renderSlide(deck.presentation.slides[slide], deck.presentation.slideSize);
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      setImage(url);
      return () => URL.revokeObjectURL(url);
    } catch {
      setImage(undefined);
      setError('Bu slaydni ko‘rsatib bo‘lmadi.');
    }
  }, [deck, slide]);

  const count = deck?.presentation.slides.length ?? 0;

  function move(offset: number) {
    const next = slide + offset;
    if (next < 0 || next >= count) return;
    setError('');
    setSlide(next);
  }

  return (
    <dialog
      ref={dialog}
      className="presentation-viewer"
      style={expanded ? { width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none', margin: 0, borderRadius: 0 } : undefined}
      aria-label={file.title}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
    >
      <div>
        <div className="presentation-viewer__header">
          <strong>{file.title}</strong>
          <Button variant="ghost" onClick={() => dialog.current?.close()}>Yopish</Button>
        </div>
        <div className="presentation-viewer__stage">
          {image && <img src={image} alt={'Slayd ' + (slide + 1)} style={expanded ? { height: '78dvh' } : undefined} onError={() => setError('Bu slaydni ko‘rsatib bo‘lmadi.')} />}
          {!deck && !error && <p role="status">Taqdimot ochilmoqda…</p>}
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="presentation-actions">
          <Button variant="secondary" disabled={slide === 0} onClick={() => move(-1)}>Oldingi</Button>
          <span aria-live="polite">{count > 0 ? (slide + 1) + ' / ' + count : '—'}</span>
          <Button variant="secondary" disabled={slide + 1 >= count} onClick={() => move(1)}>Keyingi</Button>
          <Button variant="secondary" onClick={() => setExpanded((current) => !current)}>{expanded ? 'Oddiy oyna' : 'To‘liq ekran'}</Button>
        </div>
      </div>
    </dialog>
  );
}
