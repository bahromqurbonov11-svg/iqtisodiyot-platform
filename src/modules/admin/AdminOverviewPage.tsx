import { ArrowRight } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { roadmap } from '@/data/roadmap';
import { appConfig } from '@/config/app.config';

export function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Umumiy ko‘rinish"
        description={`${appConfig.subject.name} · ${appConfig.subject.code}`}
        actions={<Button to={paths.analytics} iconRight={<ArrowRight size={16} />}>Analitika</Button>}
      />

      <Card title="Platforma holati" className="mt-5">
        <ol className="roadmap roadmap--compact">
          {roadmap.map((r) => (
            <li key={r.stage} className={`roadmap__item${r.stage === appConfig.stage ? ' is-current' : ''}`}>
              <span className="roadmap__num">{r.stage}</span>
              <div><strong>{r.title}</strong></div>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
