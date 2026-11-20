
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, ClipboardCheck, Compass, Gauge, ListChecks, Target, UserRound } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';
import { useOwnProgress, mastery } from './useOwnProgress';
import { catalogService } from '@/services/catalog.service';
import { BadgeShelf } from './BadgeShelf';
import { KpiTiles, TrendChart } from '@/modules/analytics/AnalyticsViews';

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

  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'danger' | 'none'>('all');
  const allTopics = catalogService.getTopics().data;
  const attempts = progress.attempts ?? [];
  const answered = [...progress.topics.values()].reduce((sum, t) => sum + t.total, 0);
  const correct = [...progress.topics.values()].reduce((sum, t) => sum + t.correct, 0);
  const avg = answered ? Math.round(100 * correct / answered) : 0;
  const masteredCount = allTopics.filter(t => { const v = progress.topics.get(t.globalOrder); return v && mastery(v.correct, v.total).tone === 'success'; }).length;
  const coverage = Math.round(100 * masteredCount / allTopics.length);
  const untouched = allTopics.filter(t => !progress.topics.has(t.globalOrder));
  const weakest = needsPractice[0];
  const next = weakest
    ? { text: weakest.topic.globalOrder + '-mavzuni takrorlang: hozirgi natija ' + weakest.percent + '%.', to: paths.test('test-' + weakest.topic.id), label: 'Mavzu testini ishlash' }
    : untouched[0]
      ? { text: untouched[0].globalOrder + '-mavzu bo‘yicha hali test ishlanmagan. Shundan boshlang.', to: paths.topic(untouched[0].id), label: 'Mavzuni ochish' }
      : { text: 'Barcha mavzular o‘zlashtirilgan. O‘yinlar orqali bilimingizni mustahkamlang.', to: paths.games, label: 'O‘yinlarga o‘tish' };
  const trendPoints = attempts.slice(0, 10).reverse().map(a => ({
    label: new Date(a.taken_at).toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' }),
    percent: a.total ? Math.round(100 * a.points / a.total) : 0, detail: a.points + ' / ' + a.total,
  }));
  const counts = { all: allTopics.length, success: 0, warning: 0, danger: 0, none: 0 };
  for (const t of allTopics) { const v = progress.topics.get(t.globalOrder); counts[v ? mastery(v.correct, v.total).tone : 'none']++; }
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
      {user && !user.external && !progress.loading && <>
        <div className="mt-5"><KpiTiles tiles={[
          { label: 'Test urinishlari', value: attempts.length, hint: 'topshirilgan testlar', tone: 'primary', icon: <ListChecks size={20} /> },
          { label: 'O‘rtacha natija', value: avg, suffix: '%', hint: answered + ' ta javob asosida', tone: avg >= 80 ? 'success' : avg >= 60 ? 'warning' : answered ? 'danger' : 'info', icon: <Gauge size={20} /> },
          { label: 'O‘zlashtirilgan mavzu', value: masteredCount, suffix: ' / ' + allTopics.length, hint: 'kurs bo‘yicha ' + coverage + '%', tone: 'success', icon: <Target size={20} /> },
          { label: 'Natijasi bor mavzu', value: progress.topics.size, suffix: ' / ' + allTopics.length, hint: 'qolganlarida ma’lumot yo‘q', tone: 'info', icon: <Activity size={20} /> },
        ]} /></div>
        <div className="grid grid--2 mt-5">
          <Card title="Keyingi qadam" subtitle="Natijalaringiz asosida taklif">
            <div className="next-step"><Compass size={28} aria-hidden /><p>{next.text}</p></div>
            <Button to={next.to} className="mt-3">{next.label}</Button>
          </Card>
          <Card title="Natijalar dinamikasi" subtitle="So‘nggi urinishlar, foizda">
            <TrendChart points={trendPoints} />
          </Card>
        </div>
      </>}
      {user && !user.external && <BadgeShelf userId={user.id} attempts={progress.attempts} topics={progress.topics} loading={progress.loading} />}
      {needsPractice.length > 0 && <Card title="Takrorlash uchun mavzular" className="mt-5">
        <ul className="stack stack--sm">
          {needsPractice.map(({ topic, percent }) => <li key={topic.id}>
            <Link className="link" to={paths.test('test-' + topic.id)}>{topic.title} · {percent}%</Link>
          </li>)}
        </ul>
      </Card>}
      {!user?.external && <Card title="Mavzular bo‘yicha o‘zlashtirish" subtitle="Holat bo‘yicha saralang, mavzuni bossangiz ochiladi" className="mt-5">
        <div className="chips" role="group" aria-label="Holat bo‘yicha saralash">
          {([['all', 'Barchasi'], ['success', 'O‘zlashtirilgan'], ['warning', 'Mashq kerak'], ['danger', 'Bo‘shliq'], ['none', 'Boshlanmagan']] as const).map(([key, label]) => (
            <button key={key} type="button" className={'chip' + (filter === key ? ' is-on' : '')} aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label} <span>{counts[key]}</span>
            </button>
          ))}
        </div>
        <div className="mastery-map">{allTopics.filter(topic => {
          const v = progress.topics.get(topic.globalOrder);
          const tone = v ? mastery(v.correct, v.total).tone : 'none';
          return filter === 'all' || tone === filter;
        }).map(topic => {
          const value = progress.topics.get(topic.globalOrder);
          const status = value && mastery(value.correct, value.total);
          return <Link key={topic.id} to={paths.topic(topic.id)} className={'mastery-cell ' + (status?.tone ?? '')} title={topic.title}>
            <strong>{topic.globalOrder}. {topic.title}</strong>
            <small>{status ? status.label + ' · ' + status.percent + '%' : 'Yetarli natija yo‘q'}</small>
            {status && <i className="mastery-cell__bar" aria-hidden><b style={{ width: status.percent + '%' }} /></i>}
          </Link>;
        })}</div>
      </Card>}
    </>
  );
}
