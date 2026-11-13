import { Link } from 'react-router-dom';
import { PageHeader, Card, ProgressBar, toneFor, DemoNotice, DemoBadge, MasteryBadge } from '@/components/ui';
import { analyticsService } from '@/services/analytics.service';
import { paths } from '@/navigation/paths';

export function CabinetResultsPage() {
  const rows = analyticsService.currentLearnerTopics().data;
  const levelOf = analyticsService.levelOf;

  return (
    <>
      <PageHeader
        eyebrow="Talaba kabineti"
        title="Mening natijalarim"
        description="Har bir mavzu bo‘yicha natija, urinishlar soni va o‘z bahongiz bilan taqqoslash."
        badges={<DemoBadge />}
      />
      <DemoNotice />
      <Card className="mt-5" padded={false}>
        <div className="table-wrap table-wrap--flush">
          <table className="table">
            <thead>
              <tr>
                <th>№</th>
                <th>Mavzu</th>
                <th style={{ width: '22%' }}>Natija</th>
                <th>Holat</th>
                <th className="center">Urinish</th>
                <th className="center">O‘z bahosi</th>
                <th>Farq</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const objective = r.value === null ? null : Math.round(r.value * 5);
                const diff = r.selfRating !== null && objective !== null ? r.selfRating - objective : null;
                return (
                  <tr key={r.topic.id}>
                    <td className="muted">{r.topic.globalOrder}</td>
                    <td><Link to={paths.topic(r.topic.id)} className="link">{r.topic.title}</Link></td>
                    <td>
                      <div className="cell-progress">
                        <ProgressBar value={r.value} tone={toneFor(r.value)} />
                        <span>{r.value === null ? '' : `${Math.round(r.value * 100)}%`}</span>
                      </div>
                    </td>
                    <td><MasteryBadge level={levelOf(r.value)} /></td>
                    <td className="center">{r.attempts || '—'}</td>
                    <td className="center">{r.selfRating ?? '—'}{r.selfRating ? '/5' : ''}</td>
                    <td>
                      {diff === null ? <span className="muted">—</span> : diff >= 2 ? (
                        <span className="text-danger small">O‘zini yuqori baholagan</span>
                      ) : diff <= -2 ? (
                        <span className="text-warning small">O‘zini past baholagan</span>
                      ) : (
                        <span className="text-success small">Mos</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="xs muted mt-3">“O‘z bahosi” — talabaning mavzu bo‘yicha o‘z bilimini 1–5 shkalada baholashi (so‘rovnoma, 4-bosqich).</p>
    </>
  );
}
