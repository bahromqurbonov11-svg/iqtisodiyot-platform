import { useState } from 'react';
import { Users, Target, AlertTriangle, Database, Download, Eye, Lightbulb, Microscope, ArrowRight } from 'lucide-react';
import { PageHeader, Card, StatCard, Tabs, DemoNotice, DemoBadge, Badge, Button, ProgressBar, toneFor } from '@/components/ui';
import { Heatmap, LineChart, BarList, ColumnChart } from '@/components/charts';
import { analyticsService } from '@/services/analytics.service';
import { catalogService } from '@/services/catalog.service';
import type { Insight } from '@/models';

type Tab = 'overview' | 'concepts' | 'confidence' | 'learners';

/**
 * PROFESSIONAL ANALITIKA PANELI (DEMO)
 * Javob beradigan savollar: qaysi mavzu o‘zlashtirilgan, qaysi tushunchada xato ko‘p,
 * qaysi xatolar takrorlanadi, qaysi bilim boshqasiga to‘sqinlik qiladi, dinamika,
 * qayta tushuntirish kerak bo‘lgan mavzular, ishonch va natija farqi.
 */
export function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [group, setGroup] = useState<string>('all');
  const groups = analyticsService.groups().data;

  return (
    <>
      <PageHeader
        eyebrow="Analitika"
        title="Diagnostik analitika paneli"
        description="Guruh va talabalar kesimida bilim bo‘shliqlari, takroriy xatolar va pedagogik tavsiyalar."
        badges={<DemoBadge label="DEMO ma’lumotlar" />}
        actions={
          <>
            <label className="select">
              <span className="sr-only">Guruh</span>
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="all">Barcha guruhlar</option>
                {groups.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <Button variant="secondary" icon={<Download size={16} />} disabled title="7-bosqichda">Hisobot</Button>
          </>
        }
      />
      <DemoNotice>
        Barcha raqamlar to‘qima va faqat panel tuzilmasini ko‘rsatadi. Haqiqiy tahlil talabalar javoblari yig‘ila boshlagach
        (6–7-bosqichlar) hisoblanadi.
      </DemoNotice>

      <div className="mt-5">
        <Tabs
          ariaLabel="Analitika bo‘limlari"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'overview', label: 'Umumiy holat' },
            { value: 'concepts', label: 'Tushunchalar va xatolar' },
            { value: 'confidence', label: 'Ishonch va natija' },
            { value: 'learners', label: 'Talabalar' },
          ]}
        />
      </div>

      <div className="mt-5">
        {tab === 'overview' && <Overview group={group} />}
        {tab === 'concepts' && <Concepts />}
        {tab === 'confidence' && <Confidence />}
        {tab === 'learners' && <Learners group={group} />}
      </div>
    </>
  );
}

function Overview({ group }: { group: string }) {
  const mastery = analyticsService.groupTopicMastery().data.filter((r) => group === 'all' || r.group === group);
  const trend = analyticsService.weeklyTrend().data;
  const insights = analyticsService.insights().data;
  const topics = catalogService.getTopics().data;

  const allCells = mastery.flatMap((r) => r.cells);
  const withData = allCells.filter((c) => c.value !== null);
  const avg = withData.reduce((s, c) => s + (c.value ?? 0), 0) / Math.max(withData.length, 1);
  const evidence = withData.reduce((s, c) => s + c.evidence, 0);
  const coveredTopics = new Set(withData.map((c) => c.topicId)).size;

  // Qayta tushuntirish kerak bo‘lgan mavzular (o‘rtacha < 60%)
  const byTopic = topics
    .map((t) => {
      const vals = mastery.map((r) => r.cells.find((c) => c.topicId === t.id)?.value).filter((v): v is number => v != null);
      return { topic: t, value: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null };
    })
    .filter((x) => x.value !== null)
    .sort((a, b) => (a.value ?? 0) - (b.value ?? 0));

  return (
    <div className="stack stack--lg">
      <div className="stats">
        <StatCard label="O‘rtacha o‘zlashtirish" value={`${Math.round(avg * 100)}%`} hint="Faqat dalil mavjud mavzular" icon={<Target size={18} />} />
        <StatCard label="Qamrab olingan mavzular" value={<>{coveredTopics}<small>/25</small></>} hint="Qolganlari: ma’lumot yetarli emas" icon={<Eye size={18} />} tone="info" />
        <StatCard label="Tahlil qilingan javoblar" value={evidence.toLocaleString('uz')} icon={<Database size={18} />} tone="neutral" />
        <StatCard label="Qayta tushuntirish kerak" value={byTopic.filter((x) => (x.value ?? 1) < 0.6).length} hint="O‘rtacha < 60%" icon={<AlertTriangle size={18} />} tone="danger" />
      </div>

      <Card title="Mavzular bo‘yicha o‘zlashtirish xaritasi" subtitle="Guruh × mavzu, foizda. Shtrixlangan katak — dalil yo‘q (0 deb hisoblanmaydi)." actions={<DemoBadge />}>
        <Heatmap
          ariaLabel="Guruhlar va mavzular bo‘yicha o‘zlashtirish"
          columns={topics.map((t) => String(t.globalOrder))}
          rows={mastery.map((r) => ({
            label: r.group,
            cells: r.cells.map((c, i) => ({
              key: c.topicId,
              value: c.value,
              title: `${topics[i].globalOrder}. ${topics[i].title}: ${c.value === null ? 'ma’lumot yetarli emas' : `${Math.round(c.value * 100)}% (${c.evidence} javob)`}`,
            })),
          }))}
        />
      </Card>

      <div className="grid grid--3-2">
        <Card title="Natijalar dinamikasi" subtitle="Haftalik o‘rtacha, faqat topshirganlar bo‘yicha" actions={<DemoBadge />}>
          <LineChart
            ariaLabel="Haftalik natijalar dinamikasi"
            labels={trend.weeks}
            series={trend.series.filter((s) => group === 'all' || s.name === group)}
            min={30}
            max={90}
          />
        </Card>
        <Card title="Qayta tushuntirish kerak" subtitle="Eng past natijali mavzular" actions={<DemoBadge />}>
          <ul className="mastery-list mastery-list--compact">
            {byTopic.slice(0, 5).map((x) => (
              <li key={x.topic.id}>
                <span className="mastery-list__name"><span className="num">{x.topic.globalOrder}</span>{x.topic.title}</span>
                <ProgressBar value={x.value} tone={toneFor(x.value)} />
                <span className="mastery-list__val">{Math.round((x.value ?? 0) * 100)}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Tahliliy xulosalar" subtitle="Kuzatuv, gipoteza va tavsiya aniq ajratilgan" actions={<DemoBadge />}>
        <InsightList items={insights} />
      </Card>
    </div>
  );
}

function InsightList({ items }: { items: Insight[] }) {
  const meta = {
    observation: { label: 'Kuzatuv', tone: 'info' as const, icon: Eye },
    hypothesis: { label: 'Gipoteza — tasdiqlanmagan', tone: 'warning' as const, icon: Microscope },
    recommendation: { label: 'Pedagogik tavsiya', tone: 'primary' as const, icon: Lightbulb },
  };
  return (
    <ul className="insights insights--grid">
      {items.map((i) => {
        const m = meta[i.kind];
        return (
          <li key={i.id} className={`insight insight--${i.kind}`}>
            <div className="insight__head"><m.icon size={16} /><Badge tone={m.tone}>{m.label}</Badge></div>
            <p>{i.text}</p>
            <small className="muted">Dalil: {i.evidence}</small>
          </li>
        );
      })}
    </ul>
  );
}

function Concepts() {
  const errors = analyticsService.conceptErrors().data;
  const mis = analyticsService.misconceptions().data;
  const links = analyticsService.prerequisiteLinks().data;
  return (
    <div className="stack stack--lg">
      <div className="grid grid--2">
        <Card title="Eng ko‘p xato qilinayotgan tushunchalar" subtitle="Noto‘g‘ri javoblar ulushi" actions={<DemoBadge />}>
          <BarList
            items={errors.map((e) => ({
              key: e.concept,
              label: <>{e.concept} <span className="muted xs">· {e.topicOrder}-mavzu</span></>,
              value: e.errorRate,
              meta: `${e.evidence} javob · ${e.students} talaba`,
            }))}
          />
        </Card>
        <Card title="Bilimlar bog‘liqligi" subtitle="Oldingi tushunchadagi bo‘shliq keyingi mavzuga ta’siri" actions={<Badge tone="warning">Gipoteza</Badge>}>
          <ul className="deps">
            {links.map((l) => (
              <li key={l.from}>
                <div className="deps__node"><small>{l.fromTopic}-mavzu</small>{l.from}</div>
                <div className="deps__arrow">
                  <ArrowRight size={18} />
                  <small>r = {l.strength.toFixed(2)}</small>
                </div>
                <div className="deps__node deps__node--to"><small>{l.toTopic}-mavzu</small>{l.to}</div>
              </li>
            ))}
          </ul>
          <p className="xs muted mt-3">Korrelyatsiya sababni isbotlamaydi. Bog‘liqlik qo‘shimcha diagnostik savollar bilan tekshiriladi.</p>
        </Card>
      </div>
      <Card title="Takrorlanayotgan xatolar (noto‘g‘ri tasavvurlar)" padded={false} actions={<DemoBadge />}>
        <div className="table-wrap table-wrap--flush">
          <table className="table">
            <thead>
              <tr><th>Noto‘g‘ri tasavvur</th><th>Mavzu</th><th>Talabalar ulushi</th><th>Takror</th><th>Kuzatilgan dalil</th></tr>
            </thead>
            <tbody>
              {mis.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.title}</strong></td>
                  <td>{m.topicOrder}</td>
                  <td>
                    <div className="cell-progress"><ProgressBar value={m.share} tone="danger" /><span>{Math.round(m.share * 100)}%</span></div>
                  </td>
                  <td className="center">{m.repeated}</td>
                  <td className="small muted">{m.pattern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Confidence() {
  const { levels, quadrants } = analyticsService.calibration().data;
  return (
    <div className="grid grid--3-2">
      <Card title="Ishonch darajasi va haqiqiy natija" subtitle="Har bir ishonch darajasida to‘g‘ri javoblar ulushi. Chiziq — ideal moslik." actions={<DemoBadge />}>
        <ColumnChart
          ariaLabel="Ishonch darajasi bo‘yicha aniqlik"
          cols={levels.map((l) => ({ label: `${l.confidence}`, value: l.accuracy, note: `${l.n} javob` }))}
          reference={[0.2, 0.4, 0.6, 0.8, 1]}
        />
        <p className="xs muted mt-3 center">Ishonch darajasi (1 — taxmin, 5 — to‘liq ishonch)</p>
      </Card>
      <Card title="Javoblar to‘rt guruhda" subtitle="O‘z bahosi va obyektiv natija farqi" actions={<DemoBadge />}>
        <div className="quadrants">
          {quadrants.map((q) => (
            <div key={q.key} className={`quadrant quadrant--${q.tone}`}>
              <div className="quadrant__value">{Math.round(q.value * 100)}%</div>
              <strong>{q.label}</strong>
              <small>{q.note}</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Learners({ group }: { group: string }) {
  const rows = analyticsService.learnerRows().data.filter((r) => group === 'all' || r.learner.group === group);
  return (
    <Card title="Talabalar kesimida" subtitle="Faqat tasdiqlangan talabalar" padded={false} actions={<DemoBadge />}>
      <div className="table-wrap table-wrap--flush">
        <table className="table">
          <thead>
            <tr><th>Talaba</th><th>Guruh</th><th className="center">Ishlangan mavzular</th><th style={{ width: '22%' }}>O‘rtacha natija</th><th className="center">Bo‘shliqlar</th><th>Holat</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.learner.id}>
                <td><div className="person"><span className="avatar avatar--sm">{r.learner.fullName.split(' ').map((p) => p[0]).join('')}</span><strong>{r.learner.fullName}</strong></div></td>
                <td>{r.learner.group}</td>
                <td className="center">{r.attempted}/25</td>
                <td><div className="cell-progress"><ProgressBar value={r.avg / 100} tone={toneFor(r.avg / 100)} /><span>{r.avg}%</span></div></td>
                <td className="center">{r.gaps}</td>
                <td>{r.risk ? <Badge tone="danger">E’tibor kerak</Badge> : <Badge tone="success">Barqaror</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xs muted table-note"><Users size={13} /> Individual hisobot (har bir talaba bo‘yicha batafsil sahifa) 7-bosqichda qo‘shiladi.</p>
    </Card>
  );
}
