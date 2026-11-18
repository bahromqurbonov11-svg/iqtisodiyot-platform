import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Notice, Tabs } from '@/components/ui';
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
  return <MaterialsLibrary key={user?.id ?? 'guest'} signedIn={Boolean(user)} />;
}

function MaterialsLibrary({ signedIn }: { signedIn: boolean }) {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const topics = catalogService.getTopics(partId).data;
  const [uploaded, setUploaded] = useState<ListedPresentation[] | null>(null);
  const [countError, setCountError] = useState(false);
  const [showPresentations, setShowPresentations] = useState(false);
  const [presentation, setPresentation] = useState<ListedPresentation | null>(null);
  const [downloadError, setDownloadError] = useState('');
  const listHeading = useRef<HTMLHeadingElement>(null);

  function openPresentations() {
    setShowPresentations(true);
    if (showPresentations) listHeading.current?.focus();
  }

  useEffect(() => {
    if (showPresentations) listHeading.current?.focus();
  }, [showPresentations]);

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

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘quv materiallari' }]}
        eyebrow="O‘quv materiallari"
        title="Materiallar kutubxonasi"
        description="Ma’ruzalar, taqdimotlar, keyslar, test to‘plamlari va glossariy — mavzular bo‘yicha tartiblangan holda."
      />

      <Notice kind="info" title="Taqdimotlar">
        <button type="button" className="link" aria-expanded={showPresentations} onClick={openPresentations}>
          Barcha taqdimotlarni shu sahifada ochish
        </button>
      </Notice>

      <div className="cat-grid mt-5">
        {materialCategories.map((c) => {
          const Icon = icons[c.icon];
          return (
            <Card key={c.id} className="cat-card">
              <span className="cat-card__icon"><Icon size={22} aria-hidden /></span>
              <h3>{c.id === 'slides' ? (
                <button type="button" className="link" aria-expanded={showPresentations} onClick={openPresentations}>{c.title}</button>
              ) : c.title}</h3>
              <p className="small muted">{c.description}</p>
              <div className="cat-card__foot">
                {c.id === 'slides' ? (
                  <button type="button" aria-label="Taqdimotlar ro‘yxatini ochish" aria-expanded={showPresentations} onClick={openPresentations}
                    style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer' }}>
                    <Badge tone={fullCountReady ? 'success' : 'info'}>{badgeText}</Badge>
                  </button>
                ) : c.knownInProject ? (
                  <Badge tone="accent">Loyihada mavjud: {c.knownInProject}</Badge>
                ) : (
                  <Badge>Tayyorlanadi</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {showPresentations && (
        <section className="mt-7 stack" aria-labelledby="library-presentations">
          <div className="section__head">
            <h2 id="library-presentations" ref={listHeading} tabIndex={-1}>Barcha taqdimotlar</h2>
            <Button variant="secondary" onClick={() => setShowPresentations(false)}>Ro‘yxatni yopish</Button>
          </div>
          {!signedIn && <p>Administrator yuklagan fayllarni ko‘rish uchun <Link to={paths.login} className="link">tizimga kiring</Link>.</p>}
          {signedIn && !fullCountReady && !countError && <p role="status">Taqdimotlar yuklanmoqda…</p>}
          {countError && <p role="alert">Yuklangan taqdimotlar ro‘yxatini olib bo‘lmadi.</p>}
          {downloadError && <p role="alert">{downloadError}</p>}
          {fullCountReady && slideTotal === 0 && <p>Hali taqdimot yuklanmagan.</p>}
          <ul className="files">
            {allTopics.map((topic) => (
              <li key={topic.id} className="stack stack--sm" hidden={!slideCounts[topic.id]}>
                <h3 className="small">{topic.globalOrder}. {topic.title}</h3>
                {(uploaded ?? []).filter((file) => file.topicId === topic.id).map((file) => (
                  <div key={file.id} className="file">
                    <span className="file__main">{file.title}</span>
                    <div className="file__actions">
                      {/\.pptx$/i.test(file.file_name) && <Button size="sm" variant="secondary" onClick={() => setPresentation(file)}>Slaydlarni ko‘rish</Button>}
                      <Button size="sm" variant="secondary" onClick={() => void download(file)}>Yuklab olish</Button>
                    </div>
                  </div>
                ))}
                {materialsService.list(topic.id, 'slides').data.map((file) => {
                  const view = materialsService.viewUrl(file);
                  return (
                    <div key={file.path} className="file">
                      <span className="file__main">{file.title}</span>
                      <div className="file__actions">
                        {view && <a href={view} target="_blank" rel="noreferrer" className="btn btn--secondary btn--sm">Ko‘rish</a>}
                        <a href={materialsService.fileUrl(file)} download={file.fileName} className="btn btn--secondary btn--sm">Yuklab olish</a>
                      </div>
                    </div>
                  );
                })}
              </li>
            ))}
          </ul>
        </section>
      )}
      {presentation && <PresentationViewer file={presentation} onClose={() => setPresentation(null)} />}

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
