import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader, Tabs } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { useAdminActivity } from '@/modules/admin/adminActivity';
import { AdminGameCharts } from '@/modules/admin/AdminGameCharts';
import { Activity, Gauge, ListChecks, ShieldAlert } from 'lucide-react';
import { HardList, KpiTiles, TopicMap, TopicPanel, TopicRanking, TrendChart, type Stat } from '@/modules/analytics/AnalyticsViews';

interface Result {
  attempt_id: string;
  student: string;
  taken_at: string;
  points: number;
  total: number;
  test_scope: number | null;
  student_id: string;
  group_id: string | null;
  group_name: string | null;
  items: { bank: string; number: number; question: string; topic: number | null; correct: boolean }[] | null;
}

export function CabinetResultsPage({ admin = false }: { admin?: boolean }) {
  const [results, setResults] = useState<Result[]>();
  const [failed, setFailed] = useState(false);
  const [params] = useSearchParams();
  const [student, setStudent] = useState(() => admin ? (params.get('talaba') ?? '') : '');
  const activity = useAdminActivity(admin);
  const [group, setGroup] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [report, setReport] = useState('tests');
  const [limit, setLimit] = useState(12);
  const [practice, setPractice] = useState<string>();
  const topics = catalogService.getTopics().data;
  const showTests = !admin || report === 'tests';

  useEffect(() => {
    let active = true;
    let inFlight = false;
    async function refresh() {
      if (inFlight || (admin && document.hidden)) return;
      inFlight = true;
      const { data, error } = await supabase.rpc('econ_analytics');
      inFlight = false;
      if (!active) return;
      setFailed(Boolean(error));
      if (!error) setResults(data ?? []);
    }
    void refresh();
    const timer = admin ? window.setInterval(refresh, 60_000) : undefined;
    if (admin) document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      clearInterval(timer);
      if (admin) document.removeEventListener('visibilitychange', refresh);
    };
  }, [admin]);

  const matching = (results ?? []).filter(result =>
    (!student || result.student_id === student) && (!group || String(result.group_id) === group));
  const items = matching.flatMap(result => result.items ?? []);
  const filtered = matching.filter(result => !topicFilter || result.test_scope === Number(topicFilter) ||
    result.items?.some(item => item.topic === Number(topicFilter)));
  const visibleItems = items.filter(item => !topicFilter || item.topic === Number(topicFilter));
  const questionGroups = new Map<string, typeof visibleItems>();
  visibleItems.forEach(item => {
    const key = item.bank + ':' + item.number + ':' + item.question;
    const groupItems = questionGroups.get(key) ?? [];
    groupItems.push(item);
    questionGroups.set(key, groupItems);
  });
  const difficult = [...questionGroups.values()].map(answers => ({
    label: answers[0].question, total: answers.length,
    wrong: answers.filter(item => !item.correct).length,
    percent: Math.round(100 * answers.filter(item => item.correct).length / answers.length),
    topic: answers[0].topic,
  })).filter(item => item.wrong > 0).sort((a, b) => b.wrong - a.wrong || a.percent - b.percent).slice(0, 10);
  const groups = new Map((results ?? []).filter(row => row.group_id != null).map(row => [String(row.group_id), row.group_name]));
  activity.data?.groups.forEach(entry => groups.set(String(entry.id), entry.name));
  const trend = (topicFilter ? [] : filtered).slice(0, 12).reverse();
  const answeredCount = visibleItems.length;
  const correctCount = visibleItems.filter(item => item.correct).length;
  const students = new Map((results ?? []).filter(row => !group || String(row.group_id) === group).map(row => [row.student_id, row.student]));
  const gameStudents = (activity.data?.students ?? []).filter(row => (!group || String(row.group_id) === group) && (!student || row.id === student));
  activity.data?.students.filter(row => !group || String(row.group_id) === group)
    .forEach(row => students.set(row.id, row.name));
  const testGroups = new Map<string, { label: string; total: number; points: number }>();
  for (const attempt of filtered) {
    const key = String(attempt.group_id ?? '');
    const category = testGroups.get(key) ?? { label: attempt.group_name ?? 'Guruh biriktirilmagan', total: 0, points: 0 };
    const answers = topicFilter ? attempt.items?.filter(item => item.topic === Number(topicFilter)) : undefined;
    category.total += answers ? answers.length : attempt.total;
    category.points += answers ? answers.filter(item => item.correct).length : attempt.points;
    testGroups.set(key, category);
  }

  const mapStats = new Map<number, Stat>();
  const addStat = (topic: number, total: number, correct: number) => {
    const old = mapStats.get(topic) ?? { total: 0, correct: 0 };
    mapStats.set(topic, { total: old.total + total, correct: old.correct + correct });
  };
  for (const item of items) if (item.topic) addStat(item.topic, 1, Number(item.correct));
  for (const row of matching) if (!row.items && row.test_scope && row.test_scope > 0) addStat(row.test_scope, row.total, row.points);
  const selectedTopic = topicFilter ? topics.find(topic => topic.globalOrder === Number(topicFilter)) : undefined;
  const toggleTopic = (n: number) => { setTopicFilter(current => current === String(n) ? '' : String(n)); setLimit(12); };
  const mapParts = catalogService.getSubject().data.parts.map(part => ({
    id: part.id, title: part.title, topics: topics.filter(topic => topic.partId === part.id),
  }));
  const gapCount = [...mapStats.values()].filter(stat => stat.total > 0 && 100 * stat.correct / stat.total < 60).length;
  const sumTotal = filtered.reduce((sum, row) => sum + row.total, 0);
  const sumPoints = filtered.reduce((sum, row) => sum + row.points, 0);
  const overall = answeredCount > 0 ? Math.round(100 * correctCount / answeredCount) : sumTotal > 0 ? Math.round(100 * sumPoints / sumTotal) : 0;
  const trendPoints = trend.map(result => ({
    label: new Date(result.taken_at).toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' }),
    percent: Math.round(100 * result.points / result.total),
    detail: result.points + ' / ' + result.total,
  }));

  function bars(rows: { label: string; total: number; percent: number; wrong?: number; topicId?: string; topicNumber?: number }[]) {
    return <div className="stack">{rows.map(row => (
      <div key={row.label} className="analytics-bar">
        {!admin && row.topicId ? (
          <button type="button" className="analytics-topic-button" aria-expanded={practice === row.topicId}
            onClick={() => setPractice(current => current === row.topicId ? undefined : row.topicId)}>{row.label}</button>
        ) : <strong>{row.label}</strong>}
        <progress aria-label={row.label} value={row.percent} max={100} />
        <span>{row.percent}% to‘g‘ri · {row.total} ta javob{row.wrong !== undefined && ` · ${row.wrong} ta xato`}</span>
        {!admin && row.topicId && practice === row.topicId && <div className="presentation-actions">
          <Link className="btn btn--secondary btn--sm" to={paths.topic(row.topicId) + '?tab=taqdimot'}>Slaydlar</Link>
          <Link className="btn btn--secondary btn--sm" to={paths.materials + '?tur=keyslar&mavzu=' + row.topicNumber}>Keyslar</Link>
          <Link className="btn btn--secondary btn--sm" to={paths.test('test-' + row.topicId)}>Mavzu testi</Link>
        </div>}
      </div>
    ))}</div>;
  }

  return (
    <>
      <PageHeader eyebrow={admin ? 'Analitika' : 'Shaxsiy natijalar'} title={admin ? 'Talabalar natijalari' : 'Mening natijalarim'}
        description="Mavzuni xaritadan tanlang: shu mavzu bo‘yicha natija, xatolar va tavsiyalar ochiladi." />
      {admin && <Tabs ariaLabel="Hisobot turi" value={report} onChange={setReport}
        items={[{ value: 'tests', label: 'Test natijalari' }, { value: 'games', label: 'O‘yinlar statistikasi' }]} />}
      <Card title="Natijalarni filtrlash" className="mt-5">
        <div className={admin ? 'admin-report-filters' : 'stack'}>
          {admin && <>
            <label>Guruh<select className="search-control" value={group} onChange={event => { setGroup(event.target.value); setStudent(''); setLimit(12); }}>
              <option value="">Barcha guruhlar</option>
              {[...groups].map(([id, name]) => <option key={id} value={id}>{name || id}</option>)}
            </select></label>
            <label>Talaba<select className="search-control" value={student} onChange={event => { setStudent(event.target.value); setLimit(12); }}>
              <option value="">Barcha talabalar</option>
              {[...students].map(([id, name]) => <option key={id} value={id}>{name || id}</option>)}
            </select></label>
          </>}
          <label>Mavzu<select className="search-control" value={topicFilter} onChange={event => { setTopicFilter(event.target.value); setLimit(12); }}>
            <option value="">Barcha mavzular</option>
            {topics.map(topic => <option key={topic.id} value={topic.globalOrder}>{topic.globalOrder}-mavzu · {topic.title}</option>)}
          </select></label>
        </div>
        {(group || student || topicFilter) && <Button className="mt-3" variant="secondary" onClick={() => {
          setGroup(''); setStudent(''); setTopicFilter(''); setLimit(12);
        }}>Filtrlarni tozalash</Button>}
      </Card>
      {showTests && results && <>
        <div className="mt-5"><KpiTiles tiles={[
          { label: 'Test urinishlari', value: filtered.length, hint: admin ? new Set(filtered.map(row => row.student_id)).size + ' ta talaba qatnashgan' : 'topshirilgan testlar', tone: 'primary', icon: <ListChecks size={20} /> },
          { label: 'O‘rtacha natija', value: overall, suffix: '%', hint: answeredCount + ' ta javob asosida', tone: overall >= 80 ? 'success' : overall >= 60 ? 'warning' : 'danger', icon: <Gauge size={20} /> },
          { label: 'Natijasi bor mavzular', value: mapStats.size, suffix: ' / ' + topics.length, hint: 'qolganlarida ma’lumot hali yo‘q', tone: 'info', icon: <Activity size={20} /> },
          { label: 'Bo‘shliq kuzatilgan mavzu', value: gapCount, hint: '60% dan past natija', tone: gapCount ? 'danger' : 'success', icon: <ShieldAlert size={20} /> },
        ]} /></div>
        <Card title={topics.length + ' mavzu xaritasi'} subtitle="Rang o‘zlashtirish darajasini bildiradi. Mavzuni bossangiz, tahlil pastda ochiladi." className="mt-5">
          <TopicMap parts={mapParts} stats={mapStats} selected={selectedTopic?.globalOrder} onSelect={toggleTopic} />
        </Card>
        {selectedTopic && <div className="mt-5"><TopicPanel topic={selectedTopic} stat={mapStats.get(selectedTopic.globalOrder)} hard={difficult}
          student={!admin} onClose={() => setTopicFilter('')} /></div>}
        <div className="grid grid--2 mt-5">
          <Card title="Mavzular reytingi" subtitle="Mavzu raqami, natija va xatolar soni">
            <TopicRanking topics={topics} stats={mapStats} selected={selectedTopic?.globalOrder} onSelect={toggleTopic} />
          </Card>
          <Card title="Natijalar dinamikasi" subtitle="So‘nggi urinishlar, foizda">
            <TrendChart points={trendPoints} />
          </Card>
        </div>
                {admin && <Card title="Testlar · guruhlar bo‘yicha" className="mt-5">
          <div className="admin-summary"><strong>{filtered.length} ta test urinish</strong><strong>{new Set(filtered.map(row => row.student_id)).size} ta qatnashgan talaba</strong></div>
          {testGroups.size ? bars([...testGroups.values()].filter(row => row.total > 0)
            .map(row => ({ ...row, percent: Math.round(100 * row.points / row.total), wrong: row.total - row.points }))) : <p>Bu tanlov uchun test natijasi yo‘q.</p>}
        </Card>}
        <Card title="Ko‘proq xato qilingan savollar" subtitle={selectedTopic ? selectedTopic.globalOrder + '-mavzu bo‘yicha' : 'Barcha mavzular bo‘yicha'} className="mt-5">
          <HardList rows={difficult} />
        </Card>
      </>}
        {trend.length > 0 && <Card title="Oxirgi urinishlar dinamikasi" className="mt-5">
          <ol className="analytics-trend">
            {trend.map(result => {
              const percent = Math.round(100 * result.points / result.total);
              return <li key={result.attempt_id}>
                <strong>{percent}%</strong>
                <meter min={0} max={100} value={percent} aria-label={result.points + ' / ' + result.total} />
                <small>{new Date(result.taken_at).toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</small>
              </li>;
            })}
          </ol>
        </Card>}
        {answeredCount > 0 && <Card title="Savollar bo‘yicha natija" className="mt-5">
          <div className="analytics-bar">
            <strong>{Math.round(100 * correctCount / answeredCount)}% to‘g‘ri</strong>
            <progress aria-label="To‘g‘ri javoblar ulushi" value={correctCount} max={answeredCount} />
            <span>{correctCount} ta to‘g‘ri · {answeredCount - correctCount} ta xato yoki belgilanmagan</span>
          </div>
        </Card>}
        <Card title="Mavzular bo‘yicha o‘zlashtirish" className="mt-5">
          {topicStats.length ? bars(admin ? [...topicStats].sort((a, b) => b.wrong - a.wrong || a.percent - b.percent) : topicStats) : <p>Bu tanlov uchun mavzu bo‘yicha ma’lumot yo‘q.</p>}
        </Card>
        <Card title="Ko‘proq xato qilingan savollar" className="mt-5">
          {difficult.length ? bars(difficult) : <p>Bu tanlov uchun xato qayd etilgan savol yo‘q.</p>}
        </Card>
      </>}
      {showTests && <Card title="Topshirilgan testlar" className="mt-5">
        {failed && <p role="alert">Natijalarni yuklab bo‘lmadi.</p>}
        {!results && !failed && <p role="status">Natijalar yuklanmoqda…</p>}
        {results && filtered.length === 0 && <p>Bu tanlov bo‘yicha topshirilgan testlar yo‘q.</p>}
        <div className="stack">
          {filtered.slice(0, admin ? limit : undefined).map(result => {
            const mode = result.test_scope === -1 ? '1-semestr' : result.test_scope === -2 ? '2-semestr' :
              topics.find(topic => topic.globalOrder === result.test_scope)?.title ?? 'Test';
            return (
              <div key={result.attempt_id} className="card card--pad">
                <strong>{admin ? result.student + ' · ' : ''}{mode}</strong>
                <div>{result.points} / {result.total} · {Math.round(100 * result.points / result.total)}%</div>
                <small>{new Date(result.taken_at).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</small>
              </div>
            );
          })}
        </div>
        {admin && filtered.length > limit && <Button className="mt-3" variant="secondary"
          onClick={() => setLimit(value => value + 12)}>Yana 12 ta ko‘rish</Button>}
        {!admin && <Button to={paths.tests} className="mt-3">Testlarga o‘tish</Button>}
      </Card>}
      {admin && activity.error && <p role="alert">O‘yin va guruh ma’lumotlarini yuklab bo‘lmadi.</p>}
      {!showTests && !activity.data && !activity.error && <p role="status">O‘yin natijalari yuklanmoqda…</p>}
      {!showTests && activity.data && <AdminGameCharts games={activity.data.games} students={gameStudents}
        groups={activity.data.groups} topic={topicFilter} />}
    </>
  );
}
