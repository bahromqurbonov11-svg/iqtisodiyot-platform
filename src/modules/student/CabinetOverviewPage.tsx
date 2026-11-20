
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, UserRound } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';
import { useOwnProgress, mastery } from './useOwnProgress';
import { catalogService } from '@/services/catalog.service';
import { BadgeShelf } from './BadgeShelf';

export function CabinetOverviewPage() {
  const { user } = useAuth();
  const progress = useOwnProgress();
  const latest = progress.attempts?.[0];
  const needsPractice = catalogService.getTopics().data.flatMap(topic => {
    const result = progress.topics.get(topic.globalOrder);
    if (!result) return [];
    const status = mastery(result.correct, result.total);
    return status.tone === 'success' ? [] : [{ topic, ...status }];
  }).sort((a, b) => a.percent - b.percent).slice(0, 3);

  const fullName = user?.fullName || 'Talaba';
  const group = user?.group;

  return (
    <>
      <PageHeader
        eyebrow="Talaba kabineti"
        title={`Xush kelibsiz, ${fullName}!`}
        description="Shaxsiy ta’lim kabinetingiz."
        actions={
          <Button
            to={paths.topics}
            icon={<BookOpen size={16} />}
          >
            Mavzular
          </Button>
        }
      />

      <div className="grid grid--2-1 mt-5">
        <Card title="Shaxsiy ma’lumotlar">
          <div className="stack">
            <p>
              <strong>F.I.Sh.:</strong> {fullName}
            </p>

            <p>
              <strong>Guruh:</strong>{' '}
              {group || 'Guruh ma’lumoti yuklanmagan'}
            </p>

            <p>
              <strong>Hisob holati:</strong> Faol
            </p>
          </div>

          <Button
            to={paths.cabinetProfile}
            variant="secondary"
            icon={<UserRound size={16} />}
            className="mt-3"
          >
            Profilim
          </Button>
        </Card>

        <Card title="O‘zlashtirish natijalari">
          {latest ? <p><strong>Oxirgi test:</strong> {latest.points}/{latest.total} · {mastery(latest.points, latest.total).percent}%</p> :
            <p>{progress.loading ? 'Natijalar yuklanmoqda…' : progress.error ? 'Natijalarni yuklab bo‘lmadi.' :
              user?.external ? 'Bu hisobda test natijalari saqlanmaydi.' : 'Hali topshirilgan test yo‘q.'}</p>}

          <Button
            to={paths.tests}
            variant="secondary"
            icon={<ClipboardCheck size={16} />}
            className="mt-3"
          >
            Testlarga o‘tish
          </Button>

          <p className="small mt-3">
            <Link to={paths.cabinetResults} className="link">
              Natijalar sahifasi
            </Link>
          </p>
        </Card>
      </div>
      {user && !user.external && <BadgeShelf userId={user.id} attempts={progress.attempts} topics={progress.topics} loading={progress.loading} />}
      {needsPractice.length > 0 && <Card title="Takrorlash uchun mavzular" className="mt-5">
        <ul className="stack stack--sm">
          {needsPractice.map(({ topic, percent }) => <li key={topic.id}>
            <Link className="link" to={paths.test('test-' + topic.id)}>{topic.title} · {percent}%</Link>
          </li>)}
        </ul>
      </Card>}
      {!user?.external && <Card title="Mavzular bo‘yicha o‘zlashtirish" className="mt-5">
        <div className="mastery-map">{catalogService.getTopics().data.map(topic => {
          const value = progress.topics.get(topic.globalOrder);
          const status = value && mastery(value.correct, value.total);
          return <Link key={topic.id} to={paths.topic(topic.id)} className={'mastery-cell ' + (status?.tone ?? '')} title={topic.title}>
            <strong>{topic.globalOrder}. {topic.title}</strong>
            <small>{status ? status.label + ' · ' + status.percent + '%' : 'Yetarli natija yo‘q'}</small>
          </Link>;
        })}</div>
      </Card>}
    </>
  );
}
