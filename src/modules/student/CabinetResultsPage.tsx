import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { useAdminActivity } from '@/modules/admin/adminActivity';
import { AdminGameCharts } from '@/modules/admin/AdminGameCharts';

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
  const [practice, setPractice] = useState<string>();
  const topics = catalogService.getTopics().data;

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
  const topicStats = topics.flatMap(topic => {
    const answers = visibleItems.filter(item => item.topic === topic.globalOrder);
    const legacy = matching.filter(row => !row.items && row.test_scope === topic.globalOrder &&
      (!topicFilter || topic.globalOrder === Number(topicFilter)));
    const total = answers.length + legacy.reduce((sum, row) => sum + row.total, 0);
    const points = answers.filter(item => item.correct).length + legacy.reduce((sum, row) => sum + row.points, 0);
    return total ? [{ label: topic.title, total, wrong: total - points, percent: Math.round(100 * points / total), topicId: topic.id, topicNumber: topic.globalOrder }] : [];
  }).sort((a, b) => a.percent - b.percent);
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
      <PageHeader title={admin ? 'Talabalar natijalari' : 'Mening natijalarim'} />
      <Card title="Natijalarni filtrlash" className="mt-5">
        <div className="stack">
          {admin && <>
            <label>Guruh<select className="search-control" value={group} onChange={event => { setGroup(event.target.value); setStudent(''); }}>
              <option value="">Barcha guruhlar</option>
              {[...groups].map(([id, name]) => <option key={id} value={id}>{name || id}</option>)}
            </select></label>
            <label>Talaba<select className="search-control" value={student} onChange={event => setStudent(event.target.value)}>
              <option value="">Barcha talabalar</option>
              {[...students].map(([id, name]) => <option key={id} value={id}>{name || id}</option>)}
            </select></label>
          </>}
          <label>Mavzu<select className="search-control" value={topicFilter} onChange={event => setTopicFilter(event.target.value)}>
            <option value="">Barcha mavzular</option>
            {topics.map(topic => <option key={topic.id} value={topic.globalOrder}>{topic.title}</option>)}
          </select></label>
        </div>
      </Card>
      {results && <>
        {admin && <Card title="Testlar · guruhlar bo‘yicha" className="mt-5">
          <div className="admin-summary"><strong>{filtered.length} ta test urinish</strong><strong>{new Set(filtered.map(row => row.student_id)).size} ta qatnashgan talaba</strong></div>
          {testGroups.size ? bars([...testGroups.values()].filter(row => row.total > 0)
            .map(row => ({ ...row, percent: Math.round(100 * row.points / row.total), wrong: row.total - row.points }))) : <p>Bu tanlov uchun test natijasi yo‘q.</p>}
        </Card>}
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
      <Card title="Topshirilgan testlar" className="mt-5">
        {failed && <p role="alert">Natijalarni yuklab bo‘lmadi.</p>}
        {!results && !failed && <p role="status">Natijalar yuklanmoqda…</p>}
        {results && filtered.length === 0 && <p>Bu tanlov bo‘yicha topshirilgan testlar yo‘q.</p>}
        <div className="stack">
          {filtered.map(result => {
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
        {!admin && <Button to={paths.tests} className="mt-3">Testlarga o‘tish</Button>}
      </Card>
      {admin && activity.error && <p role="alert">O‘yin va guruh ma’lumotlarini yuklab bo‘lmadi.</p>}
      {admin && activity.data && <AdminGameCharts games={activity.data.games} students={gameStudents}
        groups={activity.data.groups} topic={topicFilter} />}
    </>
  );
}
