import { useMemo, useState } from 'react';
import { Check, Dices, Play, RotateCcw, Trophy } from 'lucide-react';
import { Badge, Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { START_DEPOSIT, type Sector, type Stage } from './scenarios';
import { allSectors as sectors } from './catalog';

/**
 * "Biznes yo‘lak" — o‘qituvchi boshqaradigan guruhli o‘yin.
 * Har bir jamo bir xil depozit bilan boshlaydi, o‘z sohasini tanlaydi va shu sohaning 6 bosqichli
 * yo‘lagidan o‘tadi: har bosqichda muammo, 3 ta qaror, xarajat va natija. Oxirida foyda yoki zarar hisoblanadi.
 */
const COLORS = ['#1f8f78', '#2b6cb0', '#c2562d', '#7a3fb0', '#b8860b', '#c0453a'];

interface Entry { stage: number; pick: number | null; cost: number; income: number; overhead: number; gamble: 'win' | 'lose' | null }
interface Team { name: string; sector: Sector; stages: Stage[]; cash: number; picks: (number | null)[]; log: Entry[] }

const STAGES = 6;
function draw<T>(list: T[], n: number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}

const fmt = (n: number) => (n > 0 ? '+' : '') + Math.round(n * 10) / 10;

export function BusinessGamePage() {
  const [count, setCount] = useState(4);
  const [names, setNames] = useState(() => Array.from({ length: 6 }, (_, i) => (i + 1) + '-jamoa'));
  const [picked, setPicked] = useState<string[]>(() => ['retail', 'farm', 'sewing', 'cafe', 'it', 'build']);
  const [teams, setTeams] = useState<Team[]>();
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);
  const stageCount = STAGES;

  function start() {
    setTeams(Array.from({ length: count }, (_, i) => {
      const sector = sectors.find(s => s.id === picked[i]) ?? sectors[0];
      return { name: names[i] || (i + 1) + '-jamoa', sector, stages: draw(sector.stages, STAGES)
        .map(s => ({ ...s, options: draw(s.options, s.options.length) as Stage['options'] })),
        cash: START_DEPOSIT, picks: Array(stageCount).fill(null), log: [] };
    }));
    setStage(0); setDone(false);
  }

  function choose(teamIndex: number, option: number) {
    setTeams(list => list?.map((t, i) => i === teamIndex && t.log.length <= stage
      ? { ...t, picks: t.picks.map((p, k) => (k === stage ? option : p)) } : t));
  }

  /** Bosqichni yakunlash: xarajat, daromad va doimiy xarajat hisoblanadi. */
  function settle() {
    setTeams(list => list?.map(t => {
      if (t.log.length > stage) return t;
      const st = t.stages[stage];
      const pick = t.picks[stage];
      let cost = 0, income = 0, gamble: Entry['gamble'] = null;
      if (pick !== null && st.options[pick][1] <= t.cash) {
        const o = st.options[pick];
        cost = o[1]; income = o[2];
        if (o[4] !== undefined) { if (Math.random() < 0.5) gamble = 'win'; else { income = o[4]; gamble = 'lose'; } }
      }
      const entry: Entry = { stage, pick: pick !== null && st.options[pick][1] <= t.cash ? pick : null, cost, income, overhead: t.sector.overhead, gamble };
      return { ...t, cash: t.cash - cost + income - t.sector.overhead, log: [...t.log, entry] };
    }));
  }

  const settled = teams ? teams.every(t => t.log.length > stage) : false;
  const allChosen = teams ? teams.every(t => t.picks[stage] !== null || t.log.length > stage) : false;
  const ranking = useMemo(() => (teams ? teams.map((t, i) => ({ t, i })).sort((a, b) => b.t.cash - a.t.cash) : []), [teams]);

  if (!teams) {
    return (
      <div className="container page">
        <PageHeader title="Biznes yo‘lak" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Biznes yo‘lak' }]}
          description="Jamoalar o‘z biznes sohasini tanlab, bosqichma-bosqich muammolarni hal qiladi va qarorlari uchun xarajat qiladi." />
        <Card title="O‘yinni sozlash" subtitle={'Barcha jamoalar bir xil depozit bilan boshlaydi: ' + START_DEPOSIT + ' mln so‘m'}>
          <div className="cls-setup">
            <label>Jamoalar soni
              <select className="search-control" value={count} onChange={e => setCount(Number(e.target.value))}>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} ta jamoa</option>)}
              </select></label>
          </div>
          <h3 className="mt-4">Jamoa nomi va biznes sohasi</h3>
          <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(200px, 2fr)', gap: 10, alignItems: 'center', ['--gc' as string]: COLORS[i] }}>
                <label className="cls-names" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="cls-dot" />
                  <input className="search-control" value={names[i]} maxLength={24} aria-label={(i + 1) + '-jamoa nomi'}
                    onChange={e => setNames(l => l.map((v, k) => k === i ? e.target.value : v))} /></label>
                <select className="search-control" value={picked[i]} aria-label={(i + 1) + '-jamoa sohasi'}
                  onChange={e => setPicked(l => l.map((v, k) => k === i ? e.target.value : v))}>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
                </select>
              </div>
            ))}
          </div>
          <ol className="small muted cls-rules">
            <li>Har bir soha o‘z muammolar to‘plamiga ega ({sectors.length} ta soha). O‘yin boshida jamoa uchun shu sohadan {stageCount} ta bosqich tasodifiy tanlanadi, shuning uchun har o‘yin boshqacha bo‘ladi.</li>
            <li>Qaror xarajat talab qiladi. Daromad va to‘liq izoh bosqich yakunlangandan keyin ochiladi. Har bosqichda doimiy xarajat (ijara, kommunal) ham to‘lanadi.</li>
            <li>Ba’zi qarorlar tavakkalli: natijasi tasodifga bog‘liq. Oxirida jami daromad, xarajat va foyda yoki zarar hisoblanadi.</li>
          </ol>
          <Button className="mt-4" icon={<Play size={16} />} onClick={start}>O‘yinni boshlash</Button>
          <p className="small muted mt-3">Raqamlar o‘quv modeli uchun taxminiy. Natijalar saqlanmaydi.</p>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container page">
        <PageHeader title="Biznes yo‘lak · Yakun" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Biznes yo‘lak' }]} />
        <Card title="Yakuniy hisob" subtitle={'Boshlang‘ich depozit: ' + START_DEPOSIT + ' mln so‘m (barcha jamoalarda bir xil)'}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th>#</th><th>Jamoa</th><th>Soha</th><th>Jami daromad</th><th>Qarorlar xarajati</th><th>Doimiy xarajat</th><th>Foyda / zarar</th><th>Yakuniy kapital</th></tr></thead>
              <tbody>
                {ranking.map(({ t, i }, place) => {
                  const inc = t.log.reduce((s, e) => s + e.income, 0);
                  const cost = t.log.reduce((s, e) => s + e.cost, 0);
                  const over = t.log.reduce((s, e) => s + e.overhead, 0);
                  const net = inc - cost - over;
                  return (
                    <tr key={i} style={{ ['--gc' as string]: COLORS[i] }}>
                      <td><b>{place + 1}</b></td>
                      <td><span className="cls-dot" /> <strong>{t.name}</strong> {place === 0 && <Trophy size={16} aria-label="G‘olib" />}</td>
                      <td>{t.sector.emoji} {t.sector.name}</td>
                      <td>{Math.round(inc)} mln</td><td>{Math.round(cost)} mln</td><td>{over} mln</td>
                      <td style={{ color: net >= 0 ? '#1f7a4d' : '#c0453a', fontWeight: 700 }}>{net >= 0 ? 'Foyda ' : 'Zarar '}{fmt(net)} mln</td>
                      <td><b>{Math.round(t.cash)} mln</b></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h3 className="mt-4">Qarorlar tahlili</h3>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {teams.map((t, i) => (
              <section key={i} className="card" style={{ padding: 14, ['--gc' as string]: COLORS[i] }}>
                <h4><span className="cls-dot" /> {t.name} · {t.sector.emoji}</h4>
                <ol className="small" style={{ paddingLeft: 18 }}>
                  {t.log.map(e => {
                    const st = t.stages[e.stage];
                    const best = Math.max(...st.options.map(o => o[2] - o[1] - e.overhead));
                    const net = e.income - e.cost - e.overhead;
                    return (
                      <li key={e.stage}><b>{st.title}</b>: {net === best ? 'eng yaxshi qaror ✓' : (net >= 0 ? 'foyda ' : 'zarar ') + fmt(net) + ' mln'}
                        {net < best && <span className="muted"> (eng yuqori mumkin bo‘lgan natija: {fmt(best)} mln)</span>}
                        {e.gamble === 'lose' && <span style={{ color: '#c0453a' }}> · tavakkal o‘zini oqlamadi</span>}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
          <div className="presentation-actions mt-4">
            <Button icon={<RotateCcw size={16} />} onClick={() => setTeams(undefined)}>Yangi o‘yin</Button>
            <Button variant="secondary" to={paths.games}>O‘yinlarga qaytish</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container page">
      <PageHeader title="Biznes yo‘lak" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Biznes yo‘lak' }]}
        actions={<Button variant="secondary" size="sm" onClick={() => { if (window.confirm('O‘yin to‘xtatilsinmi? Natijalar yo‘qoladi.')) setTeams(undefined); }}>To‘xtatish</Button>} />
      <p className="muted small"><Badge tone="neutral">{stage + 1} / {stageCount} bosqich</Badge> {settled ? 'Natijalar ochildi.' : 'Har bir jamoa o‘z sohasidagi muammo uchun qaror tanlaydi.'}</p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {teams.map((t, i) => {
          const st = t.stages[stage];
          const entry = t.log[stage];
          return (
            <section key={i} className="card" style={{ padding: 16, borderTop: '4px solid ' + COLORS[i], ['--gc' as string]: COLORS[i] }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                <h3><span className="cls-dot" /> {t.name} <small className="muted">{t.sector.emoji} {t.sector.name}</small></h3>
                <strong title="Joriy mablag‘">{Math.round(t.cash)} mln</strong>
              </header>
              <p><b>{st.title}</b> <Badge tone="neutral">{st.concept}</Badge></p>
              <p className="small">{st.problem}</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {st.options.map((o, k) => {
                  const chosen = t.picks[stage] === k;
                  const taken = entry && entry.pick === k;
                  const afford = o[1] <= t.cash;
                  return (
                    <div key={k}>
                      <button type="button" disabled={!!entry || !afford} aria-pressed={chosen} onClick={() => choose(i, k)}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: entry || !afford ? 'default' : 'pointer',
                          border: '2px solid ' + (chosen || taken ? COLORS[i] : '#d6dfd9'), background: chosen || taken ? '#f0f7f3' : '#fff', opacity: !afford ? .5 : 1 }}>
                        <b>{String.fromCharCode(65 + k)}.</b> {o[0]} <span className="muted small">· xarajat {o[1]} mln{!afford ? ' (mablag‘ yetmaydi)' : ''}</span>
                        {chosen && !entry && <Check size={14} aria-label="Tanlangan" style={{ marginLeft: 6 }} />}
                      </button>
                      {entry && !taken && <p className="small muted" style={{ margin: '6px 4px' }}>
                        {o[4] === undefined
                          ? <>Daromad {o[2]} mln · Sof natija <b>{fmt(o[2] - o[1] - entry.overhead)} mln</b></>
                          : <>Sof natija · omadsiz holatda <b>{fmt(o[4] - o[1] - entry.overhead)} mln</b>, omadli holatda <b>{fmt(o[2] - o[1] - entry.overhead)} mln</b></>}
                        <br />{o[3]}
                      </p>}
                      {entry && taken && (
                        <p className="small" style={{ margin: '6px 4px' }}>
                          {entry.gamble && <Dices size={14} aria-hidden />} Daromad {entry.income} mln, xarajat {entry.cost} mln, doimiy xarajat {entry.overhead} mln → <b style={{ color: entry.income - entry.cost - entry.overhead >= 0 ? '#1f7a4d' : '#c0453a' }}>{fmt(entry.income - entry.cost - entry.overhead)} mln</b>
                          <br /><span className="muted">{entry.gamble === 'lose' ? 'Tavakkal o‘zini oqlamadi. ' : entry.gamble === 'win' ? 'Tavakkal omadli chiqdi. ' : ''}{o[3]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
                {entry && entry.pick === null && <p className="small muted">Qaror qabul qilinmadi (yoki mablag‘ yetmadi): bosqich faqat doimiy xarajat bilan o‘tdi ({fmt(-entry.overhead)} mln).</p>}
              </div>
            </section>
          );
        })}
      </div>
      <div className="presentation-actions mt-4">
        {!settled && <Button onClick={() => { if (allChosen || window.confirm('Hamma jamoa tanlamadi. Baribir yakunlansinmi?')) settle(); }}>Bosqichni yakunlash</Button>}
        {settled && (stage + 1 < stageCount
          ? <Button onClick={() => setStage(stage + 1)}>Keyingi bosqich</Button>
          : <Button onClick={() => setDone(true)}>Yakuniy hisobni ko‘rish</Button>)}
      </div>
    </div>
  );
}
