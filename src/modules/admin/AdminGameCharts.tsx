import { useState } from 'react';
import { Card } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import type { GameActivity, Learner, Group } from './adminActivity';

const names: Record<string, string> = {
  runner: 'Marraga yugurish', target: 'Mergan', 'target-answer': 'Mergan · bonus savollar',
  matching: 'Tushunchalarni moslashtirish', situation: 'Vaziyatni tahlil qiling', graph: 'Grafikni boshqar',
};

export function AdminGameCharts({ games, students, groups, topic }: {
  games: GameActivity[]; students: Learner[]; groups: Group[]; topic: string;
}) {
  const [mode, setMode] = useState('');
  const roster = new Map(students.map(student => [student.id, student]));
  const filtered = games.filter(row => roster.has(row.player) && (!mode || row.game === mode));
  const items = filtered.flatMap(row => (row.items ?? []).map(item => ({ ...item, topic: item.topic ?? row.topic })));
  const scoped = items.filter(item => !topic || item.topic === Number(topic));
  const scopedGames = filtered.filter(row => !topic || (row.items?.length
    ? row.items.some(item => (item.topic ?? row.topic) === Number(topic))
    : row.topic === Number(topic)));
  const played = [...new Set(scopedGames.map(row => row.game))];
  const topics = catalogService.getTopics().data;
  const counts = new Map<string, { label: string; total: number; wrong: number }>();
  const topicsCount = new Map<number, { label: string; total: number; wrong: number }>();
  for (const item of scoped) {
    const key = String(item.topic) + ':' + item.question;
    const question = counts.get(key) ?? { label: item.question, total: 0, wrong: 0 };
    question.total++;
    question.wrong += Number(!item.correct);
    counts.set(key, question);
    if (item.topic == null) continue;
    const topicRow = topicsCount.get(item.topic) ?? {
      label: topics.find(entry => entry.globalOrder === item.topic)?.title ?? item.topic + '-mavzu', total: 0, wrong: 0,
    };
    topicRow.total++;
    topicRow.wrong += Number(!item.correct);
    topicsCount.set(item.topic, topicRow);
  }
  function bars(values: Iterable<{ label: string; total: number; wrong: number }>) {
    const list = [...values].filter(row => row.wrong > 0).sort((a,b) => b.wrong-a.wrong || b.wrong/b.total-a.wrong/a.total).slice(0,10);
    return list.length ? <div className="stack">{list.map((row, index) => <div className="analytics-bar" key={index}>
      <strong>{row.label}</strong>
      <progress value={row.wrong} max={row.total} aria-label={row.label + ' · xato ulushi'} />
      <span>{row.wrong} / {row.total} xato · {Math.round(row.wrong * 100 / row.total)}%</span>
    </div>)}</div> : <p>Bu tanlovda xato qayd etilmagan.</p>;
  }

  return <div className="stack mt-5">
    <Card title="O‘yinlar statistikasi"><div className="stack">
      <label>O‘yin<select className="search-control" value={mode} onChange={e => setMode(e.target.value)}>
        <option value="">Barcha o‘yinlar</option>
        {Object.entries(names).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select></label>
      <div className="admin-summary"><strong>{scopedGames.length} ta faoliyat yozuvi</strong><strong>{scoped.length} ta savol javobi</strong>
        <strong>{scoped.length ? Math.round(scoped.filter(item => item.correct).length * 100 / scoped.length) + '% to‘g‘ri' : 'Savol natijasi yo‘q'}</strong></div>
      {played.map(game => {
        const gameRows = scopedGames.filter(row => row.game === game);
        const groupCounts = new Map<string, number>();
        for (const row of gameRows) {
          const group = groups.find(g => g.id === roster.get(row.player)?.group_id)?.name ?? 'Guruh biriktirilmagan';
          groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);
        }
        return <div key={game} className="analytics-bar">
          <strong>{names[game] ?? game} · {gameRows.length} yozuv</strong>
          {(game === 'runner' || game === 'target') && <span>Eng yuqori ball {gameRows.reduce((best, row) => Math.max(best, row.points), 0)}</span>}
          {[...groupCounts].map(([name, count]) => <div key={name}><span>{name} · {count} ta</span>
            <progress value={count} max={gameRows.length} aria-label={name + ' · o‘yin faoliyati'} /></div>)}
        </div>;
      })}
    </div></Card>
    <Card title="O‘yinlarda eng ko‘p xato qilingan mavzular">{bars(topicsCount.values())}</Card>
    <Card title="O‘yinlarda eng ko‘p xato qilingan savollar">{bars(counts.values())}</Card>
  </div>;
}
