import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Tabs } from '@/components/ui';
import { materialCategories, type MaterialCategory } from '@/data/materials';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';
import { materialsService } from '@/services/materials.service';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/services/auth/AuthContext';
import { PresentationViewer } from '@/modules/catalog/TopicDetailPage';

const icons: Record<MaterialCategory['icon'], typeof BookOpen> = { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText };

type ListedPresentation = { id: string; topicId: string; title: string; file_name: string; file_path: string };

export function MaterialsPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const showPresentations = params.get('tur') === 'taqdimotlar';
  return <MaterialsLibrary key={user?.id ?? 'guest'} signedIn={Boolean(user)}
    showPresentations={showPresentations} />;
}

function MaterialsLibrary({ signedIn, showPresentations }: {
  signedIn: boolean; showPresentations: boolean;
}) {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const topics = catalogService.getTopics(partId).data;
  const [uploaded, setUploaded] = useState<ListedPresentation[] | null>(null);
  const [countError, setCountError] = useState(false);
  const [presentation, setPresentation] = useState<ListedPresentation | null>(null);
  const [downloadError, setDownloadError] = useState('');
  async function download(file: ListedPresentation) {
    setDownloadError('');
    try {
      const { data, error } = await supabase.storage.from('learning-resources')
        .createSignedUrl(file.file_path, 60, { download: file.file_name });
      if (error || !data?.signedUrl) throw error;
      const link = document.createElement('a');
      link.href = data.signedUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setDownloadError('Faylni yuklab bo‘lmadi. Qayta urinib ko‘ring.');
    }
  }

  useEffect(() => {
    if (!signedIn) return;
    let active = true;

    async function loadCounts() {
      try {
        const topics = catalogService.getTopics().data;
        const topicIds = new Map(topics.flatMap((topic) => [[topic.id, topic.id], [topic.title, topic.id]]));
        const files: ListedPresentation[] = [];
        const pageSize = 500;
        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase.from('learning_resources')
            .select('id,topic_name,material_kind,title,file_name,file_path')
            .or('material_kind.eq.slides,material_kind.is.null')
            .order('id')
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          if (!active) return;
          for (const row of data) {
            const id = topicIds.get(row.topic_name ?? '');
            if (id && (row.material_kind === 'slides' || /\.(pptx|ppt|ppsx)$/i.test(row.file_name))) {
              files.push({ id: row.id, topicId: id, title: row.title, file_name: row.file_name, file_path: row.file_path });
            }
          }
          if (data.length < pageSize) break;
        }
        if (active) setUploaded(files);
      } catch {
        if (active) setCountError(true);
      }
    }

    void loadCounts();
    return () => { active = false; };
  }, [signedIn]);

  const slideCounts = materialsService.countByTopic('slides');
  const allTopics = catalogService.getTopics().data;
  for (const { topicId } of uploaded ?? []) {
    slideCounts[topicId] = (slideCounts[topicId] ?? 0) + 1;
  }
  const slideTotal = Object.values(slideCounts).reduce((total, count) => total + count, 0);
  const fullCountReady = uploaded !== null;
  const badgeText = fullCountReady ? slideTotal + ' ta fayl'
    : !signedIn ? (slideTotal ? slideTotal + ' ta ochiq fayl' : 'Ko‘rish uchun kiring')
    : countError ? 'Jami sonni yuklab bo‘lmadi' : 'Hisoblanmoqda…';

  if (showPresentations) return (
    <div className="container page stack">
      <PageHeader
        crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Taqdimotlar' }]}
        title="Taqdimotlar"
        description={fullCountReady ? slideTotal + ' ta taqdimot · mavzular bo‘yicha' : 'Mavzular bo‘yicha taqdimotlar'}
        actions={<Button to={paths.materials} variant="secondary">Materiallarga qaytish</Button>}
      />
          {!signedIn && <p>Administrator yuklagan fayllarni ko‘rish uchun <Link to={paths.login} className="link">tizimga kiring</Link>.</p>}
          {signedIn && !fullCountReady && !countError && <p role="status">Taqdimotlar yuklanmoqda…</p>}
          {countError && <p role="alert">Yuklangan taqdimotlar ro‘yxatini olib bo‘lmadi.</p>}
          {downloadError && <p role="alert">{downloadError}</p>}
          {fullCountReady && slideTotal === 0 && <p>Hali taqdimot yuklanmagan.</p>}
          <ul className="grid grid--3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {allTopics.filter((topic) => slideCounts[topic.id]).map((topic) => {
              const libraryFiles = (uploaded ?? []).filter((file) => file.topicId === topic.id);
              const repositoryFiles = materialsService.list(topic.id, 'slides').data;
              const multiple = libraryFiles.length + repositoryFiles.length > 1;
              return (
                <li key={topic.id}>
                  <Card title={topic.globalOrder + '-mavzu. ' + topic.title} className="stack stack--sm">
                    {libraryFiles.map((file) => {
                      const canPreview = /\.pptx$/i.test(file.file_name);
                      return (
                        <div key={file.id} className="stack stack--sm">
                          {multiple && <p className="small muted" style={{ overflowWrap: 'anywhere' }}>{file.file_name}</p>}
                          <FirstSlidePreview filePath={canPreview ? file.file_path : undefined} />
                          <div className="presentation-actions">
                            {canPreview && <Button size="sm" variant="secondary" onClick={() => setPresentation(file)}>Ko‘rish</Button>}
                            <Button size="sm" variant="secondary" onClick={() => void download(file)}>Yuklab olish</Button>
                          </div>
                        </div>
                      );
                    })}
                    {repositoryFiles.map((file) => {
                      const view = materialsService.viewUrl(file);
                      const url = materialsService.fileUrl(file);
                      return (
                        <div key={file.path} className="stack stack--sm">
                          {multiple && <p className="small muted" style={{ overflowWrap: 'anywhere' }}>{file.fileName}</p>}
                          <FirstSlidePreview publicUrl={file.ext.toLowerCase() === 'pptx' ? url : undefined} />
                          <div className="presentation-actions">
                            {view && <a href={view} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">Ko‘rish</a>}
                            <a href={url} download={file.fileName} className="btn btn--secondary btn--sm">Yuklab olish</a>
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </li>
              );
            })}
          </ul>
      {presentation && <PresentationViewer file={presentation} onClose={() => setPresentation(null)} />}
    </div>
  );

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘quv materiallari' }]}
        eyebrow="O‘quv materiallari"
        title="Materiallar kutubxonasi"
        description="Ma’ruzalar, taqdimotlar, keyslar, test to‘plamlari va glossariy — mavzular bo‘yicha tartiblangan holda."
      />

      <div className="cat-grid mt-5">
        {materialCategories.map((c) => {
          const Icon = icons[c.icon];
          if (c.id === 'slides') return (
            <Link key={c.id} to={paths.materials + '?tur=taqdimotlar'} className="card card--pad cat-card"
              style={{ color: 'inherit' }}>
              <span className="cat-card__icon"><Icon size={22} aria-hidden /></span>
              <strong>{c.title}</strong>
              <span className="small muted" style={{ flex: 1 }}>{c.description}</span>
              <span className="cat-card__foot"><Badge tone={fullCountReady ? 'success' : 'info'}>{badgeText}</Badge></span>
            </Link>
          );
          return (
            <Card key={c.id} className="cat-card">
              <span className="cat-card__icon"><Icon size={22} aria-hidden /></span>
              <h3>{c.title}</h3>
              <p className="small muted">{c.description}</p>
              <div className="cat-card__foot">
                {c.knownInProject ? (
                  <Badge tone="accent">Loyihada mavjud: {c.knownInProject}</Badge>
                ) : (
                  <Badge>Tayyorlanadi</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="section__head mt-7">
        <div>
          <div className="eyebrow">Mavzular bo‘yicha</div>
          <h2>Materiallar matritsasi</h2>
        </div>
        <Tabs ariaLabel="Qism" value={partId} onChange={setPartId} items={subject.parts.map((p) => ({ value: p.id, label: p.title }))} />
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>№</th>
              <th>Mavzu</th>
              <th className="center">Ma’ruza</th>
              <th className="center">Taqdimot</th>
              <th className="center">Glossariy</th>
              <th className="center">Keys</th>
              <th className="center">RU</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.id}>
                <td className="muted">{t.globalOrder}</td>
                <td><Link to={paths.topic(t.id)} className="link">{t.title}</Link></td>
                <td className="center"><span className="slot-dot" title="Fayl hali ulanmagan">—</span></td>
                <td className="center">
                  {slideCounts[t.id] ? (
                    <Link to={paths.topic(t.id)} className="count-pill" title="Taqdimotlarni ko‘rish">{slideCounts[t.id]}</Link>
                  ) : (
                    <span className="slot-dot" title={fullCountReady ? 'Taqdimot hali yuklanmagan' : 'Yuklangan taqdimotlar soni hozir ko‘rinmaydi'}>{fullCountReady ? '—' : '…'}</span>
                  )}
                </td>
                {Array.from({ length: 3 }).map((_, i) => (
                  <td key={i} className="center"><span className="slot-dot" title="Fayl hali ulanmagan">—</span></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xs muted mt-3">Raqamni bossangiz, mavzu sahifasi ochiladi.</p>
    </div>
  );
}

function FirstSlidePreview({ filePath, publicUrl }: { filePath?: string; publicUrl?: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if ((!filePath && !publicUrl) || !frame.current) return;
    let active = true;
    let previewUrl: string | undefined;

    async function load() {
      try {
        const bytes = filePath
          ? supabase.storage.from('learning-resources').download(filePath).then(({ data, error }) => {
              if (error || !data) throw new Error('Presentation unavailable');
              return data.arrayBuffer();
            })
          : fetch(publicUrl!).then((response) => {
              if (!response.ok) throw new Error('Presentation unavailable');
              return response.arrayBuffer();
            });
        const [buffer, { parse }, { renderSlide }] = await Promise.all([
          bytes, import('@pagus-kit/core'), import('@pagus-kit/renderer'),
        ]);
        if (!active) return;
        const deck = await parse(buffer);
        if (!active) return;
        if (!deck.slides[0]) throw new Error('No first slide');
        const { svg } = renderSlide(deck.slides[0], deck.slideSize);
        previewUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        setImageUrl(previewUrl);
      } catch {
        if (active) setFailed(true);
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      void load();
    }, { rootMargin: '160px' });
    observer.observe(frame.current);
    return () => {
      active = false;
      observer.disconnect();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [filePath, publicUrl]);

  return (
    <div ref={frame} style={{ aspectRatio: '16 / 9', display: 'grid', placeItems: 'center', overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-line)', borderRadius: 10 }}>
      {imageUrl && !failed ? (
        <img src={imageUrl} alt="Taqdimotning birinchi slaydi" onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      ) : <Presentation size={27} aria-label={failed ? 'Oldindan ko‘rish mavjud emas' : 'Taqdimot'} />}
    </div>
  );
}
