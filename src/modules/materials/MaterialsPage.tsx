import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText } from 'lucide-react';
import { PageHeader, Card, Badge, StageNotice, Tabs } from '@/components/ui';
import { materialCategories, type MaterialCategory } from '@/data/materials';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

const icons: Record<MaterialCategory['icon'], typeof BookOpen> = { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText };

export function MaterialsPage() {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const topics = catalogService.getTopics(partId).data;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘quv materiallari' }]}
        eyebrow="O‘quv materiallari"
        title="Materiallar kutubxonasi"
        description="Ma’ruzalar, taqdimotlar, keyslar, test to‘plamlari va glossariy — mavzular bo‘yicha tartiblangan holda."
      />

      <StageNotice stage={2}>
        Fayllar hali saytga yuklanmagan. Quyida material turlari va ularni joylashtirish tuzilmasi ko‘rsatilgan. “Loyihada mavjud”
        yozuvi Claude loyihasida aniqlangan, lekin hali ulanmagan fayllarni bildiradi. Original fayllar o‘zgartirilmaydi.
      </StageNotice>

      <div className="cat-grid mt-5">
        {materialCategories.map((c) => {
          const Icon = icons[c.icon];
          return (
            <Card key={c.id} className="cat-card">
              <span className="cat-card__icon"><Icon size={22} aria-hidden /></span>
              <h3>{c.title}</h3>
              <p className="small muted">{c.description}</p>
              <div className="cat-card__foot">
                {c.knownInProject ? <Badge tone="accent">Loyihada mavjud: {c.knownInProject}</Badge> : <Badge>Tayyorlanadi</Badge>}
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
                {Array.from({ length: 5 }).map((_, i) => (
                  <td key={i} className="center"><span className="slot-dot" title="Fayl hali ulanmagan">—</span></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xs muted mt-3">“—” — fayl hali ulanmagan. 2-bosqichda har bir katakda yuklab olish yoki ko‘rish tugmasi paydo bo‘ladi.</p>
    </div>
  );
}
