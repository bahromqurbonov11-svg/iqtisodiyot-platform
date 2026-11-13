import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { PageHeader, Card, Badge, Button, Tabs } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { references } from '@/data/subject';
import { paths } from '@/navigation/paths';
import { appConfig } from '@/config/app.config';

const kindLabel = { knowledge: 'Bilim', skill: 'Ko‘nikma', competence: 'Malaka' } as const;

export function AboutPage() {
  const subject = catalogService.getSubject().data;
  const [partId, setPartId] = useState(subject.parts[0].id);
  const part = subject.parts.find((p) => p.id === partId)!;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'Fan haqida' }]}
        eyebrow={`Fan kodi ${subject.code} · ${appConfig.organization.name}`}
        title="Fan haqida"
        description="Iqtisodiyot nazariyasi iqtisodiy tafakkurni shakllantiradi: cheklangan resurslar sharoitida tanlov, bozor mexanizmlari, makroiqtisodiy jarayonlar va davlat siyosatini tahlil qilishga o‘rgatadi."
        badges={<Badge tone="primary">Manba: rasmiy sillabuslar (2026–2027)</Badge>}
      />

      <Tabs
        ariaLabel="Fan qismlari"
        value={partId}
        onChange={setPartId}
        items={subject.parts.map((p) => ({ value: p.id, label: p.title }))}
      />

      <div className="grid grid--2-1 mt-5">
        <div className="stack">
          <Card title="Fanning maqsadi">
            <p>{part.goal}</p>
          </Card>
          <Card title="Ta’lim natijalari" subtitle="Fanni o‘zlashtirgan talaba…">
            <ul className="outcomes">
              {part.outcomes.map((o) => (
                <li key={o.code}>
                  <span className={`outcomes__code outcomes__code--${o.kind}`}>{o.code}</span>
                  <div>
                    <small className="muted">{kindLabel[o.kind]}</small>
                    <p>{o.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="stack">
          <Card title="O‘quv yuklamasi">
            <dl className="kv">
              <div><dt>ECTS kreditlar</dt><dd>{part.credits}</dd></div>
              <div><dt>Jami yuklama</dt><dd>{part.totalHours} soat</dd></div>
              <div><dt>Ma’ruza</dt><dd>{part.lectureHours} soat</dd></div>
              <div><dt>Amaliy mashg‘ulot</dt><dd>{part.practiceHours} soat</dd></div>
              <div><dt>Mustaqil ta’lim</dt><dd>{part.selfStudyHours} soat</dd></div>
              <div><dt>Ta’lim tili</dt><dd>O‘zbek / rus</dd></div>
            </dl>
            <p className="xs muted mt-3">Manba: {part.source.document}</p>
          </Card>
          <Card title="Diagnostik yondashuv">
            <p className="small muted">Platformada har bir savol quyidagi zanjirga bog‘lanadi:</p>
            <ol className="chain">
              {['Fan', 'Mavzu', 'Tushuncha', 'Ko‘nikma', 'Savol', 'Javob', 'Xato turi'].map((s, i, a) => (
                <li key={s}>
                  <span>{s}</span>
                  {i < a.length - 1 && <ChevronRight size={14} aria-hidden />}
                </li>
              ))}
            </ol>
            <p className="small mt-3">Shu tufayli natija “umumiy ball” emas, balki aynan qaysi tushunchada qanday chalkashlik borligini ko‘rsatadi.</p>
          </Card>
          <Button to={`${paths.topics}?qism=${part.id}`} iconRight={<ArrowRight size={16} />} block>
            {part.title} mavzulari
          </Button>
        </div>
      </div>

      <Card title="Asosiy va qo‘shimcha adabiyotlar" className="mt-5">
        <ol className="refs">
          {Object.entries(references).slice(0, 11).map(([n, r]) => (
            <li key={n}><span className="refs__n">[{n}]</span> {r}</li>
          ))}
        </ol>
        <h4 className="mt-4">Axborot manbalari</h4>
        <ol className="refs">
          {Object.entries(references).slice(11).map(([n, r]) => (
            <li key={n}><span className="refs__n">[{n}]</span> {r}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
