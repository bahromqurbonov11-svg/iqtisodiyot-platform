import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, HelpCircle, ListChecks } from 'lucide-react';
import { PageHeader, Card, Badge, Button, StageNotice, DemoBadge } from '@/components/ui';
import { testCatalog, demoQuestion } from '@/data/demo/tests';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';
import { NotFoundPage } from '@/modules/public/NotFoundPage';

/**
 * Test sahifasi shabloni: kirish ma’lumoti + savol interfeysi namunasi.
 * Savol namunasi BAHOLANMAYDI — faqat ko‘rinishni ko‘rsatadi.
 */
export function TestDetailPage() {
  const { testId = '' } = useParams();
  const test = testCatalog.find((t) => t.id === testId);
  const [picked, setPicked] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  if (!test) return <NotFoundPage />;
  const topic = catalogService.getTopic(test.topicId)!;

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Testlar', to: paths.tests }, { label: `${topic.globalOrder}-mavzu` }]}
        eyebrow="Diagnostik test"
        title={topic.title}
        badges={<Badge tone="neutral">Rejalashtirilgan</Badge>}
        actions={<Button to={paths.topic(topic.id)} variant="secondary">Mavzuga qaytish</Button>}
      />

      <div className="grid grid--1-2">
        <div className="stack">
          <Card title="Test haqida">
            <dl className="kv">
              <div><dt><HelpCircle size={14} /> Savollar</dt><dd>~{test.plannedQuestions} ta</dd></div>
              <div><dt><Clock size={14} /> Vaqt</dt><dd>Belgilanadi</dd></div>
              <div><dt><ListChecks size={14} /> Urinishlar</dt><dd>Har biri saqlanadi</dd></div>
            </dl>
          </Card>
          <StageNotice stage={4}>Test hali faol emas. Boshlash tugmasi savollar banki tayyor bo‘lgach ishlaydi.</StageNotice>
          <Button disabled block title="4-bosqichda ishga tushadi">Testni boshlash</Button>
        </div>

        <Card
          title="Savol interfeysi namunasi"
          subtitle="Javob tanlash mumkin, lekin baholanmaydi va saqlanmaydi"
          actions={<DemoBadge label="NAMUNA" />}
        >
          <div className="q">
            <div className="q__meta">
              <span>Savol 3 / 15</span>
              <span className="q__concept">Tushuncha: {demoQuestion.concept}</span>
            </div>
            <div className="q__progress"><div style={{ width: '20%' }} /></div>
            <p className="q__stem">{demoQuestion.stem}</p>
            <div className="q__options" role="radiogroup" aria-label="Javob variantlari">
              {demoQuestion.options.map((o) => (
                <button
                  key={o.id}
                  role="radio"
                  aria-checked={picked === o.id}
                  className={`q__option${picked === o.id ? ' is-picked' : ''}`}
                  onClick={() => setPicked(o.id)}
                >
                  <span className="q__letter">{o.id.toUpperCase()}</span>
                  {o.text}
                </button>
              ))}
            </div>
            <div className="q__confidence">
              <span className="small">Javobingizga qanchalik ishonasiz?</span>
              <div className="q__scale" role="radiogroup" aria-label="Ishonch darajasi">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} role="radio" aria-checked={confidence === n} className={confidence === n ? 'is-picked' : ''} onClick={() => setConfidence(n)}>
                    {n}
                  </button>
                ))}
              </div>
              <span className="xs muted">1 — taxmin qildim · 5 — to‘liq ishonaman</span>
            </div>
            <div className="q__actions">
              <Button variant="ghost" disabled>Oldingi</Button>
              <Button disabled title="Namuna — baholanmaydi">Keyingi savol</Button>
            </div>
            {picked && (
              <p className="xs muted mt-3">
                Namuna rejimi: tanlovingiz saqlanmadi. Haqiqiy testda bu javob, ishonch darajasi va sarflangan vaqt urinish tarkibida
                saqlanadi. <Link className="link" to={paths.about}>Diagnostik yondashuv haqida</Link>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
