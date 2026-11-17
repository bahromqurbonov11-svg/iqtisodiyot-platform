import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText } from 'lucide-react';
import { PageHeader, Card, Badge, Notice, Tabs } from '@/components/ui';
import { materialCategories, type MaterialCategory } from '@/data/materials';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';
import { materialsService } from '@/services/materials.service';

const icons: Record<MaterialCategory['icon'], typeof BookOpen> = { BookOpen, Presentation, FileQuestion, Briefcase, BookA, Languages, ScrollText };

export function MaterialsPage() {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const topics = catalogService.getTopics(partId).data;
  const slideCounts = materialsService.countByTopic('slides');
  const slideTotal = materialsService.total('slides');

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘quv materiallari' }]}
        eyebrow="O‘quv materiallari"
        title="Materiallar kutubxonasi"
        description="Ma’ruzalar, taqdimotlar, keyslar, test to‘plamlari va glossariy — mavzular bo‘yicha tartiblangan holda."
      />

      <Notice kind="info" title={slideTotal ? `Taqdimotlar ishlaydi: ${slideTotal} ta fayl yuklangan` : 'Taqdimotlar bo‘limi ishlaydi'}>
        O‘qituvchi har bir mavzu uchun taqdimotlarni (.pptx, .pdf) qo‘lda yuklaydi; ular mavzu sahifasida ko‘rish va yuklab olish uchun
        chiqadi. Ma’ruza matnlari, glossariy va keyslar 2-bosqichda qo‘shiladi.
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
                  <Badge tone="success">Ishlaydi · {slideTotal} ta fayl</Badge>
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
                    <span className="slot-dot" title="Taqdimot hali yuklanmagan">—</span>
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
      <p className="xs muted mt-3">Raqam — yuklangan taqdimotlar soni (bosilsa mavzu sahifasi ochiladi). “—” — fayl hali yo‘q.</p>
    </div>
  );
}
