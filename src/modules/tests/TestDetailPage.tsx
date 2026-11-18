import { useParams } from 'react-router-dom';
import { Clock, HelpCircle, ListChecks } from 'lucide-react';
import { PageHeader, Card, Badge, Button, StageNotice } from '@/components/ui';
import { testCatalog } from '@/data/demo/tests';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';
import { NotFoundPage } from '@/modules/public/NotFoundPage';

export function TestDetailPage() {
  const { testId = '' } = useParams();
  const test = testCatalog.find((t) => t.id === testId);
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

      <div className="stack">
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
      </div>
    </div>
  );
}
