import { ReadOnlySlides } from '@/modules/materials/ReadOnlySlides';
import { FirstSlidePreview } from '@/modules/materials/FirstSlidePreview';
import { SlideCover } from '@/modules/materials/SlideCover';
import { powerpointEmbedUrl } from '@/services/powerpointEmbed';
import { useTopicAccess } from '@/services/TopicAccess';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Download, ClipboardCheck, Gamepad2, Clock,
} from 'lucide-react';
import { PageHeader, Card, Badge, Button, StageBadge } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { references } from '@/data/subject';
import { topicConcepts } from '@/data/topicConcepts';
import { ConceptCards } from './ConceptCards';
import { TopicDiagram } from './TopicDiagram';
import { topicVisuals } from './TopicsPage';
import { topicStyle } from './topicStyle';
import { paths } from '@/navigation/paths';
import { NotFoundPage } from '@/modules/public/NotFoundPage';
import { SlidesList } from '@/modules/materials/SlidesList';
import { materialsService } from '@/services/materials.service';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/services/auth/AuthContext';

/**
 * MAVZU SAHIFASI SHABLONI — barcha 25 mavzu uchun bitta komponent.
 * Mazmun bloklari 2-bosqichda (materiallar, tushunchalar) to‘ldiriladi.
 */
export function TopicDetailPage() {
  const access = useTopicAccess();
  const progress = useOwnProgress();
  const [sectionParams] = useSearchParams();
  const conceptsSection = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sectionParams.get('tab') === 'tushunchalar') {
      const frame = requestAnimationFrame(() => conceptsSection.current?.scrollIntoView());
      return () => cancelAnimationFrame(frame);
    }
  }, [sectionParams]);
  const { topicId = '' } = useParams();
  const topic = catalogService.getTopic(topicId);
  if (!topic) return <NotFoundPage />;
  const materialsOpen = access.allows(topic.globalOrder);

  const part = catalogService.getSubject().data.parts.find((p) => p.id === topic.partId)!;
  const siblings = catalogService.getTopics(topic.partId).data;
  const { prev, next } = catalogService.getAdjacent(topic.id);

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
          </>
        }
      />

      <div className="topic-layout">
        <div className="stack">
          <div style={{ ['--gc' as string]: topicStyle(topic.globalOrder).color }}>
            <Card title={topic.globalOrder + '-mavzu · tasvir'} subtitle="Qadamni bossangiz, tushuntirish almashadi">
              <TopicDiagram topicNumber={topic.globalOrder} visual={topicVisuals[topic.globalOrder - 1]} />
            </Card>
          </div>

          <Card title="Mavzu rejasi" subtitle="Sillabusdagi asosiy masalalar">
            <ol className="plan">
              {topic.subtopics.map((s, i) => (
                <li key={s}><span>{i + 1}</span>{s}</li>
              ))}
            </ol>
          </Card>

          {materialsOpen ? <UploadedMaterials topicId={topic.id} topicTitle={topic.title} /> :
            <div id="topic-locked-slides" className="topic-slide-anchor">
              <Card title="Taqdimotlar" subtitle="Bu mavzuning taqdimotlarini ko‘rish va yuklab olish cheklangan.">
                <SlideCover number={topic.globalOrder} floating />
                <div className="presentation-actions">
                  <Button variant="secondary" disabled>Slaydlarni ko‘rish</Button>
                  <Button variant="secondary" disabled>Yuklab olish</Button>
                </div>
              </Card>
            </div>}
          <Card title="Ma’ruza matni">
            {materialsOpen
              ? <Button variant="secondary" to={paths.materials + '?tur=maruzalar&mavzu=' + topic.globalOrder}>Ma’ruzani o‘qish</Button>
              : <><p className="small muted">Bu mavzuning ma’ruza matniga kirish cheklangan.</p><Button variant="secondary" disabled>Ma’ruzani o‘qish</Button></>}
          </Card>

          <div ref={conceptsSection} className="topic-slide-anchor"><Card title="Asosiy tushunchalar">
            <ConceptCards concepts={topicConcepts[topic.globalOrder - 1]} />
          </Card></div>

          <div className="grid grid--2">
            <Card title="Diagnostik test" actions={<StageBadge stage={4} />}>
              <p className="small muted">Har bir savol mavzu tushunchasiga va ehtimoliy xato turiga bog‘lanadi.</p>
              <Button to={materialsOpen ? paths.test(`test-${topic.id}`) : undefined} disabled={!materialsOpen} variant="secondary" icon={<ClipboardCheck size={16} />} className="mt-3">
                Test sahifasi
              </Button>
            </Card>
            <Card title="O‘yinlar" actions={<Badge tone="info">2 ta o‘yin</Badge>}>
              <div className="game-mini-list">
                <Link to={paths.game('moslashtirish') + '?mavzu=' + topic.id} className="game-mini">
                  <Gamepad2 size={16} /> Tushunchalarni moslashtirish · 10 ta
                </Link>
                <Link to={paths.game('vaziyatli-qaror') + '?mavzu=' + topic.id} className="game-mini">
                  <Gamepad2 size={16} /> Vaziyatni tahlil qiling · 10 ta
                </Link>
              </div>
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
          <Card title="Mavzu natijasi">
            {(() => {
              const result = progress.topics.get(topic.globalOrder);
              if (!result) return <p>{progress.loading ? 'Natija yuklanmoqda…' : progress.error ? 'Natijani yuklab bo‘lmadi.' : 'Bu mavzu bo‘yicha hali natija yo‘q.'}</p>;
              const status = mastery(result.correct, result.total);
              return <div className="stack stack--sm">
                <Badge tone={status.tone}>{status.label} · {status.percent}%</Badge>
                <progress value={result.correct} max={result.total} aria-label="Mavzu o‘zlashtirish darajasi" />
                <small>{result.correct} / {result.total} ta to‘g‘ri</small>
              </div>;
            })()}
            <Button className="mt-3" variant="secondary" disabled={!materialsOpen}
              to={materialsOpen ? paths.test('test-' + topic.id) : undefined}>Mavzu testini ishlash</Button>
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
  powerpoint_embed_url?: string | null;
  id: string;
  title: string;
  description: string | null;
  material_kind: string | null;
  file_name: string;
  file_path: string;
};

function UploadedMaterials({ topicId, topicTitle }: { topicId: string; topicTitle: string }) {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const section = useRef<HTMLDivElement>(null);
  const openSlides = params.get('tab') === 'taqdimot';
  useEffect(() => {
    if (openSlides) {
      const frame = requestAnimationFrame(() => section.current?.scrollIntoView({ block: 'start' }));
      return () => cancelAnimationFrame(frame);
    }
  }, [openSlides, topicId]);

  if (user?.external) return <div className="topic-slide-anchor" ref={section}><ReadOnlySlides key={topicId} number={catalogService.getTopic(topicId)?.globalOrder ?? 0} /></div>;

  return <div className="topic-slide-anchor" ref={section}>
    <MaterialFiles key={topicId + ':' + (user?.id ?? 'guest')} topicId={topicId} topicTitle={topicTitle} guest={!user} />
  </div>;
}

function MaterialFiles({ topicId, topicTitle, guest = false }: { topicId: string; topicTitle: string; guest?: boolean }) {
  const [files, setFiles] = useState<UploadedMaterial[] | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<UploadedMaterial | null>(null);
  const [liteOpen, setLiteOpen] = useState(false);
  /** Telefonlarda xotira cheklangan bo‘lsa, matnli ko‘rinishni ham taklif qilamiz. */
  const lite = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data, error: loadError } = await supabase
          .from('learning_resources')
          .select('id,title,description,material_kind,file_name,file_path,powerpoint_embed_url')
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

  const slides = files?.filter((file) => file.material_kind === 'slides' || (!file.material_kind && /\.(pptx|ppt|ppsx)$/i.test(file.file_name))) ?? [];
  const other = files?.filter((file) => !slides.includes(file)) ?? [];
  const repositoryCount = materialsService.list(topicId).data.length;

  function renderFiles(items: UploadedMaterial[]) {
    return (
        <ul className="stack">
          {items.map((file) => {
            const preview = slides.includes(file) && /\.pptx$/i.test(file.file_name);
            return (
            <li key={file.id} className={preview ? 'slot slot--with-preview' : 'slot'}>
              {preview && <FirstSlidePreview key={file.file_path} filePath={file.file_path} floating />}
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
            );
          })}
        </ul>
    );
  }

  const number = catalogService.getTopic(topicId)?.globalOrder ?? 0;
  if (guest && (error || !files || (slides.length === 0 && repositoryCount === 0))) return <ReadOnlySlides number={number} />;

  return (
    <>
      <Card title="Taqdimotlar" subtitle="Ma’ruza slaydlari — ko‘rish va yuklab olish"
        actions={slides.length + repositoryCount > 0 ? <Badge tone="success">{slides.length + repositoryCount} ta fayl</Badge> : undefined}>
        {error && <p role="alert">{error}</p>}
        {!files && !error && <p role="status">Materiallar yuklanmoqda…</p>}
        {slides.length > 0 && renderFiles(slides)}
        {(repositoryCount > 0 || (files && slides.length === 0)) && <SlidesList topicId={topicId} />}
      </Card>
      {other.length > 0 && <Card title="Boshqa o‘quv materiallari">{renderFiles(other)}</Card>}
      {lite && slides.length > 0 && !liteOpen &&
        <Button variant="secondary" onClick={() => setLiteOpen(true)}>Slaydlarni matn shaklida ko‘rish</Button>}
      {liteOpen && <ReadOnlySlides number={number} />}
      {presentation && <PresentationViewer file={presentation} onClose={() => setPresentation(null)} />}
    </>
  );
}

type Presentation = Awaited<ReturnType<typeof import('@pagus-kit/core').parse>>;
type SlideRenderer = typeof import('@pagus-kit/renderer').renderSlide;

type PresentationFile = Pick<UploadedMaterial, 'title' | 'file_path' | 'powerpoint_embed_url'>;

export function PresentationViewer({ file, onClose }: { file: PresentationFile; onClose: () => void }) {
  const embed = powerpointEmbedUrl(file.powerpoint_embed_url);
  const [useLocal, setUseLocal] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (embed && !useLocal) dialog.current?.showModal();
  }, [embed, useLocal]);

  if (!embed || useLocal) return <LocalPresentationViewer file={file} onClose={onClose} />;

  return (
    <dialog className="presentation-viewer" ref={dialog} aria-label={file.title} onClose={onClose}>
      <div className="presentation-viewer__header">
        <strong>{file.title}</strong>
        <Button variant="ghost" onClick={() => dialog.current?.close()}>Yopish</Button>
      </div>
      <iframe className="presentation-viewer__office" src={embed} title={file.title + ' — PowerPoint'}
        allowFullScreen referrerPolicy="no-referrer" />
      <Button variant="secondary" onClick={() => setUseLocal(true)}>Sayt ko‘ruvchisida ochish</Button>
    </dialog>
  );
}

function LocalPresentationViewer({ file, onClose }: { file: PresentationFile; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [deck, setDeck] = useState<{ presentation: Presentation; renderSlide: SlideRenderer; links: Awaited<ReturnType<typeof readSlideLinks>> | null } | null>(null);
  const [slide, setSlide] = useState(0);
  const [step, setStep] = useState(0);
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
        const bytes = await result.data.arrayBuffer();
        const [presentation, links] = await Promise.all([parse(bytes), readSlideLinks(bytes).catch(() => null)]);
        if (presentation.slides.length === 0) throw new Error('Presentation is empty');
        if (active) setDeck({ presentation, renderSlide, links });
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
      const current = deck.presentation.slides[slide];
      const { svg } = deck.renderSlide(current, deck.presentation.slideSize);
      const animatedSvg = renderAnimationStep(svg, current.animations, step);
      const url = URL.createObjectURL(new Blob([animatedSvg], { type: 'image/svg+xml' }));
      setImage(url);
      return () => URL.revokeObjectURL(url);
    } catch {
      setImage(undefined);
      setError('Bu slaydni ko‘rsatib bo‘lmadi.');
    }
  }, [deck, slide, step]);

  const count = deck?.presentation.slides.length ?? 0;
  const stepCount = deck?.presentation.slides[slide]?.animations?.steps.length ?? 0;

  function goTo(next: number, nextStep = 0) {
    setError('');
    setSlide(next);
    setStep(nextStep);
  }

  function move(offset: number) {
    if (offset > 0 && step < stepCount) {
      setStep(step + 1);
      return;
    }
    if (offset < 0 && step > 0) {
      setStep(step - 1);
      return;
    }
    const next = slide + offset;
    if (next < 0 || next >= count) return;
    goTo(next, offset < 0 ? deck?.presentation.slides[next].animations?.steps.length ?? 0 : 0);
  }

  return (
    <dialog
      ref={dialog}
      className="presentation-viewer"
      style={expanded ? { width: '100vw', height: '100dvh', maxWidth: 'none', maxHeight: 'none', margin: 0, borderRadius: 0 } : undefined}
      aria-label={file.title}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
          (event.key === ' ' && !(event.target instanceof Element && event.target.closest('button, [role="button"]')))) {
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
        <div className="presentation-viewer__stage" style={{ position: 'relative' }}>
          {image && <img key={image} src={image} alt={'Slayd ' + (slide + 1)} style={expanded ? { height: '78dvh' } : undefined} onClick={() => move(1)} onLoad={(event) => {
              if (step > 0) return;
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
              const transition = deck?.presentation.slides[slide]?.transition;
              if (transition?.type === 'cut') return;
              event.currentTarget.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: transition?.duration ?? 180 });
            }} onError={() => setError('Bu slaydni ko‘rsatib bo‘lmadi.')} />}
          {image && deck?.links && deck.links.width > 0 && deck.links.height > 0 && (
            <svg viewBox={'0 0 ' + deck.links.width + ' ' + deck.links.height}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {deck.links.slides[slide]?.map((link, index) => (
                <rect key={index} x={link.left} y={link.top} width={link.width} height={link.height}
                  fill="transparent" style={{ pointerEvents: 'all', cursor: 'pointer' }} role="button" tabIndex={0}
                  aria-label={link.label + ' — ' + (link.slide + 1) + '-slayd'}
                  onClick={() => goTo(link.slide)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      goTo(link.slide);
                    }
                  }} />
              ))}
            </svg>
          )}
          {!deck && !error && <p role="status">Taqdimot ochilmoqda…</p>}
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="presentation-actions">
          <Button variant="secondary" disabled={slide === 0 && step === 0} onClick={() => move(-1)}>Oldingi</Button>
          <span aria-live="polite">{count > 0 ? (slide + 1) + ' / ' + count : '—'}
            {stepCount > 0 && <small> · Animatsiya {step}/{stepCount}</small>}
          </span>
          <Button variant="secondary" disabled={slide + 1 >= count && step >= stepCount} onClick={() => move(1)}>Keyingi</Button>
          <Button variant="secondary" onClick={() => setExpanded((current) => !current)}>{expanded ? 'Oddiy oyna' : 'To‘liq ekran'}</Button>
        </div>
      </div>
    </dialog>
  );
}

function renderAnimationStep(svg: string, animations: Presentation['slides'][number]['animations'], step: number) {
  if (!animations?.steps.length) return svg;
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const shapes = new Map(Array.from(document.querySelectorAll('[data-pagus-id]'), node =>
    [node.getAttribute('data-pagus-id'), node]));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shown = new Set<Element>();

  animations.steps.forEach(({ effects }, index) => {
    for (const effect of effects) {
      if (effect.animClass !== 'entrance') continue;
      const shape = shapes.get(effect.targetId);
      const target = effect.paragraphIndex === undefined ? shape
        : Array.from(shape?.querySelectorAll('[data-pagus-p-idx]') ?? [])
          .find(node => node.getAttribute('data-pagus-p-idx') === String(effect.paragraphIndex));
      if (!target || shown.has(target)) continue;
      if (index >= step) {
        target.setAttribute('opacity', '0');
      } else {
        shown.add(target);
        if (index !== step - 1 || reduced || effect.preset !== 'fade') continue;
        const fade = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        fade.setAttribute('attributeName', 'opacity');
        fade.setAttribute('from', '0');
        fade.setAttribute('to', target.getAttribute('opacity') ?? '1');
        fade.setAttribute('dur', Math.max(1, effect.duration) + 'ms');
        fade.setAttribute('begin', Math.max(0, effect.delay ?? 0) + 'ms');
        fade.setAttribute('fill', 'freeze');
        target.setAttribute('opacity', '0');
        target.append(fade);
      }
    }
  });

  return new XMLSerializer().serializeToString(document);
}

type SlideLink = { left: number; top: number; width: number; height: number; slide: number; label: string };

async function readSlideLinks(bytes: ArrayBuffer) {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(bytes);
  const parser = new DOMParser();
  const readXml = async (path: string) => {
    const entry = zip.file(path);
    return entry ? parser.parseFromString(await entry.async('string'), 'application/xml') : null;
  };
  const elements = (parent: Document | Element | null, name: string) =>
    parent ? Array.from(parent.getElementsByTagNameNS('*', name)) : [];
  const relationships = async (path: string) => {
    const file = new URL(path, 'https://pptx.invalid/');
    const parts = file.pathname.slice(1).split('/');
    const name = parts.pop();
    const xml = await readXml([...parts, '_rels', name + '.rels'].join('/'));
    return new Map(elements(xml, 'Relationship')
      .filter((item) => item.getAttribute('Type')?.endsWith('/slide') && item.getAttribute('TargetMode') !== 'External')
      .map((item) => {
        const target = new URL(item.getAttribute('Target') || '', file);
        return [item.getAttribute('Id'), target.origin === file.origin ? target.pathname.slice(1) : ''];
      }));
  };
  const relationId = (node: Element) => Array.from(node.attributes)
    .find((attribute) => attribute.localName === 'id' && attribute.namespaceURI?.endsWith('/relationships'))?.value ?? null;
  const presentation = await readXml('ppt/presentation.xml');
  const references = await relationships('ppt/presentation.xml');
  const size = elements(presentation, 'sldSz')[0];
  const width = Number(size?.getAttribute('cx'));
  const height = Number(size?.getAttribute('cy'));
  const ids = elements(presentation, 'sldIdLst')[0];
  const paths = elements(ids ?? null, 'sldId').map((id) => references.get(relationId(id)) ?? '');
  const indexes = new Map(paths.map((path, index) => [path, index]));
  const slides = await Promise.all(paths.map(async (path) => {
    const xml = await readXml(path);
    const links = elements(xml, 'hlinkClick');
    if (!links.length) return [];
    const targets = await relationships(path);
    return links.flatMap((link): SlideLink[] => {
      if (link.getAttribute('action') !== 'ppaction://hlinksldjump') return [];
      const slide = indexes.get(targets.get(relationId(link)) || '');
      if (slide === undefined) return [];
      let shape = link.parentElement;
      while (shape && !['sp', 'pic', 'graphicFrame'].includes(shape.localName)) shape = shape.parentElement;
      const transform = elements(shape, 'xfrm')[0];
      const origin = elements(transform ?? null, 'off')[0];
      const extent = elements(transform ?? null, 'ext')[0];
      const left = Number(origin?.getAttribute('x'));
      const top = Number(origin?.getAttribute('y'));
      const boxWidth = Number(extent?.getAttribute('cx'));
      const boxHeight = Number(extent?.getAttribute('cy'));
      if (![left, top, boxWidth, boxHeight].every(Number.isFinite) || boxWidth <= 0 || boxHeight <= 0) return [];
      const label = elements(link.parentElement?.parentElement ?? null, 't')[0]?.textContent?.trim()
        || link.getAttribute('tooltip') || 'O‘tish';
      return [{ left, top, width: boxWidth, height: boxHeight, slide, label }];
    });
  }));
  return { width, height, slides };
}
import { useOwnProgress, mastery } from '@/modules/student/useOwnProgress';
