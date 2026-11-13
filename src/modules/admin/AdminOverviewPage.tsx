import { Link } from 'react-router-dom';
import { Users, UserCheck, Hourglass, Activity, ArrowRight, AlertTriangle } from 'lucide-react';
import { PageHeader, Card, StatCard, DemoNotice, DemoBadge, StatusBadge, Button, Badge } from '@/components/ui';
import { learnersService, analyticsService } from '@/services/analytics.service';
import { paths } from '@/navigation/paths';
import { roadmap } from '@/data/roadmap';
import { appConfig } from '@/config/app.config';

export function AdminOverviewPage() {
  const learners = learnersService.list().data;
  const pending = learners.filter((l) => l.status === 'pending');
  const approved = learners.filter((l) => l.status === 'approved');
  const insights = analyticsService.insights().data;
  const atRisk = analyticsService.learnerRows().data.filter((r) => r.risk);

  return (
    <>
      <PageHeader
        eyebrow="Administrator paneli"
        title="Umumiy ko‘rinish"
        description={`${appConfig.subject.name} · ${appConfig.subject.code}`}
        badges={<DemoBadge />}
        actions={<Button to={paths.analytics} iconRight={<ArrowRight size={16} />}>Analitika</Button>}
      />
      <DemoNotice />

      <div className="stats mt-5">
        <StatCard label="Ro‘yxatdagi talabalar" value={learners.length} hint="Rejadagi miqyos: 200–300" icon={<Users size={18} />} />
        <StatCard label="Tasdiqlangan" value={approved.length} icon={<UserCheck size={18} />} tone="success" />
        <StatCard label="Tasdiq kutmoqda" value={pending.length} hint="Ko‘rib chiqish kerak" icon={<Hourglass size={18} />} tone="warning" />
        <StatCard label="Xavf guruhida" value={atRisk.length} hint="Past natija yoki ≥3 bo‘shliq" icon={<AlertTriangle size={18} />} tone="danger" />
      </div>

      <div className="grid grid--2 mt-5">
        <Card title="Tasdiq kutayotgan arizalar" actions={<Link to={paths.adminLearners} className="link small">Barchasi</Link>}>
          <ul className="people">
            {pending.map((l) => (
              <li key={l.id}>
                <span className="avatar avatar--sm">{l.fullName.split(' ').map((p) => p[0]).join('')}</span>
                <div><strong>{l.fullName}</strong><small className="muted">{l.group} · {l.registeredAt}</small></div>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        </Card>
        <Card title="So‘nggi tahliliy xulosalar" actions={<Activity size={18} className="muted" />}>
          <ul className="insights">
            {insights.slice(0, 3).map((i) => (
              <li key={i.id} className={`insight insight--${i.kind}`}>
                <Badge tone={i.kind === 'hypothesis' ? 'warning' : i.kind === 'recommendation' ? 'primary' : 'info'}>
                  {i.kind === 'observation' ? 'Kuzatuv' : i.kind === 'hypothesis' ? 'Gipoteza' : 'Tavsiya'}
                </Badge>
                <p>{i.text}</p>
                <small className="muted">Dalil: {i.evidence}</small>
              </li>
            ))}
          </ul>
        </Card>
      </div>

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
