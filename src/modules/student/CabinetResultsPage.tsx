import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader, Tabs } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { useAdminActivity } from '@/modules/admin/adminActivity';
import { AdminGameCharts } from '@/modules/admin/AdminGameCharts';
import { Activity, Gauge, ListChecks, ShieldAlert } from 'lucide-react';
import { QuestionRanking, KpiTiles, TopicMap, TopicPanel, TopicRanking, TrendChart, type Stat } from '@/modules/analytics/AnalyticsViews';

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
  items: { bank: string; number: number; question: string; topic: number | null; correct: boolean | null }[] | null;
}

const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit' });
const groupKey = (id: string | number | null) => id == null ? 'ungrouped' : String(id);

export function CabinetResultsPage({ admin = false }: { admin?: boolean }) {
  const [results, setResults] = useState<Result[]>();
  const [failed, setFailed] = useState(false);
  const [params] = useSearchParams();
  const [student, setStudent] = useState(() => admin ? (params.get('talaba') ?? '') : '');
  const activity = useAdminActivity(admin);
  const [group, setGroup] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [kind, setKind] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
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

  const kindOf = (scope: number | null) => scope === null ? 'general' : scope > 0 ? 'topic' : 'semester';
  const inDateRange = (timestamp: string) => {
    if (!fromDate && !toDate) return true;
    const date = localDate.format(new Date(timestamp));
    return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  };
  const baseMatching = (results ?? []).filter(result =>
    (!student || result.student_id === student) && (!group || groupKey(result.group_id) === group) && inDateRange(result.taken_at));
  const matching = baseMatching.filter(result => !kind || kindOf(result.test_scope) === kind);
  const filtered = matching.flatMap(row => {
    const items = row.items?.filter(item => typeof item.correct === 'boolean') ?? [];
    const detailed = items.length === row.total && row.total > 0;
    if (!topicFilter) return [{ ...row, items }];
    const selectedTopicNumber = Number(topicFilter);
    if (row.test_scope === selectedTopicNumber) return [{ ...row, items }];
    if (!detailed || (row.test_scope ?? 0) > 0) return [];
    const selected = items.filter(item => item.topic === selectedTopicNumber);
    return selected.length ? [{ ...row, items: selected, total: selected.length, points: selected.filter(item => item.correct).length }] : [];
  });
  const kindLabels: Record<string, string> = { topic: 'Mavzulashtirilgan testlar', general: 'Umumiy testlar', semester: 'Semestr testlari' };
  const kindRows = Object.entries(kindLabels).filter(([key]) => !kind || key === kind).map(([key, label]) => {
    const rows = filtered.filter(result => kindOf(result.test_scope) === key);
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const points = rows.reduce((sum, row) => sum + row.points, 0);
    return { key, label, attempts: rows.length, students: new Set(rows.map(row => row.student_id)).size, total, percent: total ? Math.round(100 * points / total) : 0 };
  });
  /** Har bir mavzu bo‘yicha: mavzulashtirilgan va umumiy/semestr testlaridagi javoblar. */
  const perTopic = topics.filter(topic => !topicFilter || topic.globalOrder === Number(topicFilter)).map(topic => {
    let sTotal = 0, sCorrect = 0, gTotal = 0, gCorrect = 0;
    for (const row of filtered) {
      if (row.test_scope === topic.globalOrder) {
        sTotal += row.total;
        sCorrect += row.points;
      } else if (row.test_scope === null || row.test_scope < 0) {
        for (const item of row.items ?? []) if (item.topic === topic.globalOrder) { gTotal++; gCorrect += Number(item.correct); }
      }
    }
    return { topic, sTotal, sCorrect, gTotal, gCorrect };
  });
  const visibleItems = filtered.flatMap(result => result.items);
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
  })).filter(item => item.wrong > 0).sort((a, b) => b.wrong - a.wrong || a.percent - b.percent);
  const groups = new Map((results ?? []).map(row => [groupKey(row.group_id), row.group_name ?? 'Guruhsiz']));
  activity.data?.groups.forEach(entry => groups.set(String(entry.id), entry.name));
  if (activity.data?.students.some(row => row.group_id == null)) groups.set('ungrouped', 'Guruhsiz');
  const trend = filtered.filter(row => row.total > 0).slice(0, 12).reverse();
  const students = new Map((results ?? []).filter(row => !group || groupKey(row.group_id) === group).map(row => [row.student_id, row.student]));
  const gameStudents = (activity.data?.students ?? []).filter(row => (!group || groupKey(row.group_id) === group) && (!student || row.id === student));
  activity.data?.students.filter(row => !group || groupKey(row.group_id) === group)
    .forEach(row => students.set(row.id, row.name));
  const testGroups = new Map<string, { label: string; total: number; points: number }>();
  const totalsByStudent = new Map<string, {
    id: string; name: string; group: string; attempts: number; total: number; points: number;
  }>();
  for (const attempt of filtered) {
    const key = String(attempt.group_id ?? '');
    const category = testGroups.get(key) ?? { label: attempt.group_name ?? 'Guruh biriktirilmagan', total: 0, points: 0 };
    category.total += attempt.total;
    category.points += attempt.points;
    testGroups.set(key, category);
    if (admin && attempt.total > 0) {
      const learner = totalsByStudent.get(attempt.student_id) ?? {
        id: attempt.student_id, name: attempt.student || 'Ism kiritilmagan',
        group: attempt.group_name ?? 'Guruhsiz', attempts: 0, total: 0, points: 0,
      };
      learner.attempts++;
      learner.total += attempt.total;
      learner.points += attempt.points;
      totalsByStudent.set(learner.id, learner);
    }
  }
  const ranking = [...totalsByStudent.values()].sort((a, b) =>
    b.points * a.total - a.points * b.total || b.total - a.total || a.name.localeCompare(b.name, 'uz'));

  const mapStats = new Map<number, Stat>();
  const addStat = (topic: number, total: number, correct: number) => {
    const old = mapStats.get(topic) ?? { total: 0, correct: 0 };
    mapStats.set(topic, { total: old.total + total, correct: old.correct + correct });
  };
  for (const row of filtered) {
    if (row.test_scope && row.test_scope > 0) {
      addStat(row.test_scope, row.total, row.points);
    } else {
      for (const item of row.items) if (item.topic) addStat(item.topic, 1, Number(item.correct));
    }
  }
  const selectedTopic = topicFilter ? topics.find(topic => topic.globalOrder === Number(topicFilter)) : undefined;
  const toggleTopic = (n: number) => { setTopicFilter(current => current === String(n) ? '' : String(n)); setLimit(12); };
  const mapParts = catalogService.getSubject().data.parts.map(part => ({
    id: part.id, title: part.title, topics: topics.filter(topic => topic.partId === part.id),
  }));
  const gapCount = [...mapStats.values()].filter(stat => stat.total > 0 && 100 * stat.correct / stat.total < 60).length;
  const sumTotal = filtered.reduce((sum, row) => sum + row.total, 0);
  const sumPoints = filtered.reduce((sum, row) => sum + row.points, 0);
  const overall = sumTotal > 0 ? Math.round(100 * sumPoints / sumTotal) : 0;
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
          {showTests && <label>Test turi<select className="search-control" value={kind} onChange={event => { setKind(event.target.value); setLimit(12); }}>
            <option value="">Barcha testlar</option>
            {Object.entries(kindLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></label>}
          <label>Mavzu<select className="search-control" value={topicFilter} onChange={event => { setTopicFilter(event.target.value); setLimit(12); }}>
            <option value="">Barcha mavzular</option>
            {topics.map(topic => <option key={topic.id} value={topic.globalOrder}>{topic.globalOrder}-mavzu · {topic.title}</option>)}
          </select></label>
          {admin && <>
            <label>Boshlanish sanasi<input type="date" className="search-control" value={fromDate}
              max={toDate || undefined} onChange={event => { setFromDate(event.target.value); setLimit(12); }} /></label>
            <label>Tugash sanasi<input type="date" className="search-control" value={toDate}
              min={fromDate || undefined} onChange={event => { setToDate(event.target.value); setLimit(12); }} /></label>
          </>}
        </div>
        {(group || student || topicFilter || (showTests && kind) || fromDate || toDate) && <Button className="mt-3" variant="secondary" onClick={() => {
          setGroup(''); setStudent(''); setTopicFilter(''); setKind(''); setFromDate(''); setToDate(''); setLimit(12);
        }}>Filtrlarni tozalash</Button>}
      </Card>
      {showTests && results && <>
        <div className="mt-5"><KpiTiles tiles={[
          { label: 'Test urinishlari', value: filtered.length, hint: admin ? new Set(filtered.map(row => row.student_id)).size + ' ta talaba qatnashgan' : 'topshirilgan testlar', tone: 'primary', icon: <ListChecks size={20} /> },
          { label: 'O‘rtacha natija', value: sumTotal ? overall : null, suffix: sumTotal ? '%' : undefined, hint: sumTotal ? sumTotal + ' ta savol asosida' : 'Natija mavjud emas', tone: !sumTotal ? 'info' : overall >= 80 ? 'success' : overall >= 60 ? 'warning' : 'danger', icon: <Gauge size={20} /> },
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
        {admin && <Card title="Talabalar reytingi" subtitle="Tanlangan testlardagi to‘g‘ri javoblar ulushi bo‘yicha. Ulush teng bo‘lsa, ko‘proq savol ishlagan talaba yuqorida turadi." className="mt-5">
          {ranking.length ? <div className="table-wrap"><table className="table">
            <thead><tr><th>O‘rin</th><th>Talaba</th><th>Guruh</th><th>Testlar</th><th>To‘g‘ri javoblar</th><th>Natija</th></tr></thead>
            <tbody>{ranking.map((row, index) => <tr key={row.id}>
              <td data-label="O‘rin">{index + 1}</td>
              <td data-label="Talaba"><button type="button" className="analytics-topic-button"
                aria-pressed={student === row.id} onClick={() => { setStudent(current => current === row.id ? '' : row.id); setLimit(12); }}>
                {row.name}
              </button></td>
              <td data-label="Guruh">{row.group}</td>
              <td data-label="Testlar">{row.attempts}</td>
              <td data-label="To‘g‘ri javoblar">{row.points} / {row.total}</td>
              <td data-label="Natija"><strong>{(100 * row.points / row.total).toFixed(2).replace('.', ',')}%</strong></td>
            </tr>)}</tbody>
          </table></div> : <p>Bu tanlov bo‘yicha reyting uchun test natijasi yo‘q.</p>}
        </Card>}
        {admin && <Card title="Testlar · guruhlar bo‘yicha" className="mt-5">
          <div className="admin-summary"><strong>{filtered.length} ta test urinish</strong><strong>{new Set(filtered.map(row => row.student_id)).size} ta qatnashgan talaba</strong></div>
          {testGroups.size ? bars([...testGroups.values()].filter(row => row.total > 0)
            .map(row => ({ ...row, percent: Math.round(100 * row.points / row.total), wrong: row.total - row.points }))) : <p>Bu tanlov uchun test natijasi yo‘q.</p>}
        </Card>}
        {admin && <Card title="Test turlari bo‘yicha statistika" subtitle="Mavzulashtirilgan, umumiy va semestr testlari alohida hisoblanadi" className="mt-5">
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Test turi</th><th>Urinishlar</th><th>Talabalar</th><th>Javoblar</th><th>To‘g‘ri</th></tr></thead>
            <tbody>{kindRows.map(row => <tr key={row.key}>
              <td data-label="Test turi"><strong>{row.label}</strong></td><td data-label="Urinishlar">{row.attempts}</td>
              <td data-label="Talabalar">{row.students}</td><td data-label="Javoblar">{row.total}</td>
              <td data-label="To‘g‘ri">{row.total ? row.percent + '%' : '—'}</td></tr>)}</tbody>
          </table></div>
        </Card>}
        {admin && <Card title="Mavzular bo‘yicha: test turlari taqqosi" subtitle="Har bir mavzuda mavzulashtirilgan va umumiy/semestr testlaridagi to‘g‘ri javoblar ulushi" className="mt-5">
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Mavzu</th><th>Mavzulashtirilgan</th><th>Umumiy / semestr</th></tr></thead>
            <tbody>{perTopic.map(row => <tr key={row.topic.id}>
              <td data-label="Mavzu"><strong>{row.topic.globalOrder}.</strong> {row.topic.title}</td>
              <td data-label="Mavzulashtirilgan">{row.sTotal ? Math.round(100 * row.sCorrect / row.sTotal) + '% · ' + row.sTotal + ' ta javob' : 'ma’lumot yo‘q'}</td>
              <td data-label="Umumiy / semestr">{row.gTotal ? Math.round(100 * row.gCorrect / row.gTotal) + '% · ' + row.gTotal + ' ta javob' : 'ma’lumot yo‘q'}</td></tr>)}</tbody>
          </table></div>
        </Card>}
        <Card title="Ko‘p xato qilingan savollar reytingi" subtitle={selectedTopic ? selectedTopic.globalOrder + '-mavzu bo‘yicha' : 'Barcha mavzular bo‘yicha'} className="mt-5">
          <QuestionRanking rows={difficult} />
        </Card>
      </>}
      {showTests && <Card title="Topshirilgan testlar" className="mt-5">
        {failed && <p role="alert">Natijalarni yuklab bo‘lmadi.</p>}
        {!results && !failed && <p role="status">Natijalar yuklanmoqda…</p>}
        {results && filtered.length === 0 && <p>Bu tanlov bo‘yicha topshirilgan testlar yo‘q.</p>}
        <div className="stack">
          {filtered.slice(0, admin ? limit : undefined).map(result => {
            const mode = result.test_scope === -1 ? '1-semestr' : result.test_scope === -2 ? '2-semestr' :
              (result.test_scope && result.test_scope > 0 ? result.test_scope + '-mavzu · ' : '') + (topics.find(topic => topic.globalOrder === result.test_scope)?.title ?? 'Test');
            return (
              <div key={result.attempt_id} className="card card--pad">
                <strong>{admin ? result.student + ' · ' : ''}{mode}</strong>
                <div>{selectedTopic && <span>{selectedTopic.globalOrder}-mavzu kesimi · </span>}
                  {result.total ? result.points + ' / ' + result.total + ' · ' + Math.round(100 * result.points / result.total) + '%' : '—'}</div>
                <small>{new Date(result.taken_at).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</small>
                <details className="mt-3">
                  <summary>Savolma-savol tafsilot</summary>
                  {!!result.items.length && <ol className="stack mt-3">
                    {result.items.map((item, i) => <li key={item.bank + ':' + item.number + ':' + i}>
                      <strong>{item.correct ? 'To‘g‘ri' : 'Xato'}</strong>{' · '}{item.question}
                    </li>)}
                  </ol>}
                  {result.items.length < result.total && <p className="small muted mt-3">
                    {result.items.length ? 'Ayrim savollarning tafsiloti saqlanmagan.' : 'Bu urinishning savolma-savol tafsiloti saqlanmagan.'}
                  </p>}
                </details>
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
      {!showTests && activity.data && <AdminGameCharts games={activity.data.games.filter(row => inDateRange(row.played_at))} students={gameStudents}
        groups={activity.data.groups} topic={topicFilter} />}
    </>
  );
}
