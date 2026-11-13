import { Link } from 'react-router-dom';
import { BookOpen, Target, TrendingUp, AlertTriangle, ArrowRight, ClipboardCheck } from 'lucide-react';
import { PageHeader, Card, StatCard, ProgressBar, toneFor, DemoNotice, DemoBadge, Button, MasteryBadge } from '@/components/ui';
import { analyticsService } from '@/services/analytics.service';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';

export function CabinetOverviewPage() {
  const { user } = useAuth();
  const rows = analyticsService.currentLearnerTopics().data;
  const withData = rows.filter((r) => r.value !== null);
  const avg = withData.reduce((s, r) => s + (r.value ?? 0), 0) / withData.length;
  const gaps = withData.filter((r) => (r.value ?? 1) < 0.55);
  const firstName = user?.fullName.split(' ')[1] ?? '';

  return (
    <>
      <PageHeader
        eyebrow="Talaba kabineti"
        title={`Xush kelibsiz, ${firstName}!`}
        description="O‘zlashtirish holatingiz, kuchli tomonlaringiz va qayta ko‘rish kerak bo‘lgan mavzular."
        badges={<DemoBadge />}
        actions={<Button to={paths.topics} icon={<BookOpen size={16} />}>Mavzular</Button>}
      />
      <DemoNotice />

      <div className="stats mt-5">
        <StatCard label="Ishlangan mavzular" value={<>{withData.length}<small>/25</small></>} hint="Kamida bitta urinish" icon={<BookOpen size={18} />} />
        <StatCard label="O‘rtacha natija" value={`${Math.round(avg * 100)}%`} hint="Faqat ishlangan mavzular bo‘yicha" icon={<Target size={18} />} tone="success" />
        <StatCard label="Bilim bo‘shliqlari" value={gaps.length} hint="Natija 55% dan past" icon={<AlertTriangle size={18} />} tone="danger" />
        <StatCard label="Ma’lumot yo‘q" value={rows.length - withData.length} hint="Hali ishlanmagan — 0 deb hisoblanmaydi" icon={<TrendingUp size={18} />} tone="neutral" />
      </div>

      <div className="grid grid--2-1 mt-5">
        <Card title="Mavzular bo‘yicha o‘zlashtirish" subtitle="Iqtisodiyot nazariyasi 1" actions={<Link className="link small" to={paths.cabinetResults}>Batafsil</Link>}>
          <ul className="mastery-list">
            {rows.slice(0, 12).map((r) => (
              <li key={r.topic.id}>
                <Link to={paths.topic(r.topic.id)} className="mastery-list__name">
                  <span className="num">{r.topic.globalOrder}</span>{r.topic.title}
                </Link>
                <ProgressBar value={r.value} tone={toneFor(r.value)} label={r.topic.title} />
                <span className="mastery-list__val">{r.value === null ? '—' : `${Math.round(r.value * 100)}%`}</span>
              </li>
            ))}
          </ul>
        </Card>
        <div className="stack">
          <Card title="Qayta ko‘rish tavsiya etiladi">
            <ul className="todo">
              {gaps.map((g) => (
                <li key={g.topic.id}>
                  <MasteryBadge level="gap" />
                  <Link to={paths.topic(g.topic.id)} className="link">{g.topic.title}</Link>
                </li>
              ))}
            </ul>
            <p className="xs muted mt-3">Tavsiya kuzatilgan natijaga asoslangan (DEMO). 7-bosqichda aniq tushuncha va xato turi ko‘rsatiladi.</p>
          </Card>
          <Card title="Keyingi qadam">
            <p className="small">Navbatdagi mavzu: <strong>{rows[8].topic.title}</strong></p>
            <Button to={paths.test(`test-${rows[8].topic.id}`)} variant="secondary" icon={<ClipboardCheck size={16} />} iconRight={<ArrowRight size={14} />} className="mt-3">
              Test sahifasi
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
