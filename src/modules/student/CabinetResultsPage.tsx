import { useEffect, useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';

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
  const [student, setStudent] = useState('');
  const [group, setGroup] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const topics = catalogService.getTopics().data;

  useEffect(() => {
    let active = true;
    void supabase.rpc('econ_analytics').then(({ data, error }) => {
      if (!active) return;
      if (error) setFailed(true);
      else setResults(data ?? []);
    });
    return () => { active = false; };
  }, []);

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
    return total ? [{ label: topic.title, total, percent: Math.round(100 * points / total) }] : [];
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
    percent: Math.round(100 * answers.filter(item => item.correct).length / answers.length),
  })).filter(item => item.percent < 100).sort((a, b) => a.percent - b.percent || b.total - a.total).slice(0, 10);
  const groups = new Map((results ?? []).filter(row => row.group_id != null).map(row => [String(row.group_id), row.group_name]));
  const students = new Map((results ?? []).filter(row => !group || String(row.group_id) === group).map(row => [row.student_id, row.student]));

  function bars(rows: typeof topicStats) {
    return <div className="stack">{rows.map(row => (
      <div key={row.label} className="analytics-bar">
        <strong>{row.label}</strong>
        <progress aria-label={row.label} value={row.percent} max={100} />
        <span>{row.percent}% · {row.total} ta javob</span>
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
        <Card title="Mavzular bo‘yicha o‘zlashtirish" className="mt-5">
          {topicStats.length ? bars(topicStats) : <p>Bu tanlov uchun mavzu bo‘yicha ma’lumot yo‘q.</p>}
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
    </>
  );
}
