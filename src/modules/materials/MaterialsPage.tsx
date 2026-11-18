import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText } from 'lucide-react';
import { PageHeader, Card, Badge, Notice, Tabs } from '@/components/ui';
import { materialCategories, type MaterialCategory } from '@/data/materials';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';
import { materialsService } from '@/services/materials.service';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/services/auth/AuthContext';

const icons: Record<MaterialCategory['icon'], typeof BookOpen> = { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText };

export function MaterialsPage() {
  const { user } = useAuth();
  return <MaterialsLibrary key={user?.id ?? 'guest'} signedIn={Boolean(user)} />;
}

function MaterialsLibrary({ signedIn }: { signedIn: boolean }) {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const topics = catalogService.getTopics(partId).data;
  const [uploaded, setUploaded] = useState<Record<string, number> | null>(null);
  const [countError, setCountError] = useState(false);

  useEffect(() => {
    if (!signedIn) return;
    let active = true;

    async function loadCounts() {
      try {
        const topics = catalogService.getTopics().data;
        const topicIds = new Map(topics.flatMap((topic) => [[topic.id, topic.id], [topic.title, topic.id]]));
        const counts: Record<string, number> = {};
        const pageSize = 500;
        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase.from('learning_resources')
            .select('topic_name,material_kind,file_name')
            .or('material_kind.eq.slides,material_kind.is.null')
            .order('id')
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          if (!active) return;
          for (const row of data) {
            const id = topicIds.get(row.topic_name ?? '');
            if (id && (row.material_kind === 'slides' || /\.(pptx|ppt|ppsx)$/i.test(row.file_name))) {
              counts[id] = (counts[id] ?? 0) + 1;
            }
          }
          if (data.length < pageSize) break;
        }
        if (active) setUploaded(counts);
      } catch {
        if (active) setCountError(true);
      }
    }

    void loadCounts();
    return () => { active = false; };
  }, [signedIn]);

  const slideCounts = materialsService.countByTopic('slides');
  for (const [id, count] of Object.entries(uploaded ?? {})) {
    slideCounts[id] = (slideCounts[id] ?? 0) + count;
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
        {signedIn ? 'Taqdimotni ko‘rish yoki yuklab olish uchun mavzu sahifasini oching.' : (
          <>Administrator yuklagan taqdimotlar va ularning sonini ko‘rish uchun <Link to={paths.login} className="link">tizimga kiring</Link>.</>
        )}
      </Notice>

      <div className="cat-grid mt-5">
        {materialCategories.map((c) => {
          const Icon = icons[c.icon];
          return (
            <Card key={c.id} className="cat-card">
              <span className="cat-card__icon"><Icon size={22} aria-hidden /></span>
              <h3>{c.title}</h3>
              <p className="small muted">{c.description}</p>
              <div className="cat-card__foot">
                {c.id === 'slides' ? (
                  <Badge tone={fullCountReady ? 'success' : 'info'}>{badgeText}</Badge>
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
