import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, BookOpen, ChevronRight, Clock, ListChecks, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { catalogService } from '@/services/catalog.service';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';
import cases from '@/data/cases.json';

const catalog = paths.materials + '?tur=keyslar';

export function CasesPage() {
  const [params, setParams] = useSearchParams();
  const topic = params.get('mavzu') ?? '';
  const current = cases.find(item => String(item.id) === params.get('keys'));
  const topics = catalogService.getTopics().data;
  const shown = cases.filter(item => !topic || String(item.topic) === topic);
  const topicName = (id: number) => topics.find(item => item.globalOrder === id)?.title ?? '';

  if (current) {
    const lines = current.body;
    const story: string[] = [];
    const problems: string[] = [];
    const tasks: string[] = [];
    let mode: 'story' | 'problems' | 'tasks' = 'story';
    for (const raw of lines) {
      const mark = raw.match(/^(Vaziyat tavsifi|Vaziyat|Muammolar|Muammo|Topshiriqlar|Topshiriq)\s*[.:]\s*(.*)$/is);
      let text = raw;
      if (mark) {
        const key = mark[1].toLowerCase();
        mode = key.startsWith('muammo') ? 'problems' : key.startsWith('topshiriq') ? 'tasks' : 'story';
        text = mark[2];
      }
      text = text.trim();
      if (!text) continue;
      if (mode === 'story') story.push(text);
      else if (mode === 'problems') problems.push(text.replace(/^\d+\s*[.)-]\s*/, ''));
      else tasks.push(text.replace(/^\d+\s*[.)-]\s*/, ''));
    }
    const minutes = Math.max(1, Math.round(lines.join(' ').split(/\s+/).length / 180));
    const list = shown;
    const at = list.findIndex(item => item.id === current.id);
    const near = (item?: (typeof cases)[number]) => item ? catalog + '&keys=' + item.id + (topic ? '&mavzu=' + topic : '') : undefined;
    const prev = near(list[at - 1]);
    const next = near(list[at + 1]);
    const title = current.title.charAt(0) + current.title.slice(1).toLowerCase();
    return (
      <div className="container page">
        <nav className="crumbs" aria-label="Yo‘l">
          <Link to={paths.materials}>Materiallar</Link> <span aria-hidden>›</span>{' '}
          <Link to={catalog + (topic ? '&mavzu=' + topic : '')}>Keyslar</Link> <span aria-hidden>›</span>{' '}
          <span aria-current="page">{current.id}-keys</span>
        </nav>
        <header className="case-hero">
          <span className="case-hero__no"><BookOpen size={18} aria-hidden /> {current.id}-keys</span>
          <h1>{title}</h1>
          <p>{current.topic}-mavzu · {topicName(current.topic)}</p>
          <ul className="case-hero__meta">
            <li><Clock size={15} aria-hidden /> ~{minutes} daqiqa o‘qish</li>
            {problems.length > 0 && <li><AlertTriangle size={15} aria-hidden /> {problems.length} ta muammo</li>}
            {tasks.length > 0 && <li><ListChecks size={15} aria-hidden /> {tasks.length} ta topshiriq</li>}
          </ul>
        </header>
        <div className="case-layout case-layout--split">
          <article className="case-paper">
            <h2 className="case-sec"><span><BookOpen size={17} aria-hidden /></span> Vaziyat tavsifi</h2>
            <div className="case-text">{story.map((line, index) => <p key={index}>{line}</p>)}</div>
            {problems.length > 0 && (
              <>
                <h2 className="case-sec case-sec--problems"><span><AlertTriangle size={17} aria-hidden /></span> {problems.length > 1 ? 'Muammolar' : 'Muammo'}</h2>
                <ol className="case-tasks case-problems">{problems.map((item, index) => <li key={index}><b>{index + 1}</b><p>{item}</p></li>)}</ol>
              </>
            )}
            {tasks.length > 0 && (
              <>
                <h2 className="case-sec case-sec--tasks"><span><ListChecks size={17} aria-hidden /></span> Topshiriqlar</h2>
                <ol className="case-tasks">{tasks.map((task, index) => <li key={index}><b>{index + 1}</b><p>{task}</p></li>)}</ol>
              </>
            )}
            <nav className="case-nav" aria-label="Keyslar orasida">
              {prev ? <Link to={prev} onClick={() => window.scrollTo(0, 0)}>← Oldingi keys</Link> : <span />}
              {next ? <Link to={next} onClick={() => window.scrollTo(0, 0)}>Keyingi keys →</Link> : <span />}
            </nav>
          </article>
          <aside className="case-side"><CaseSolution key={current.id} id={current.id} /></aside>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <PageHeader crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Keyslar' }]}
        title="Iqtisodiy keyslar" description="Mavzuni tanlang va amaliy vaziyatni tahlil qiling." />
      <Card className="case-filter">
        <label htmlFor="case-topic">Mavzu</label>
        <select id="case-topic" className="search-control" value={topic} onChange={event => {
          const value = event.target.value;
          setParams(value ? { tur: 'keyslar', mavzu: value } : { tur: 'keyslar' });
        }}>
          <option value="">Barcha mavzular</option>
          {topics.filter(item => cases.some(entry => entry.topic === item.globalOrder)).map(item => (
            <option key={item.id} value={item.globalOrder}>{item.globalOrder}. {item.title}</option>
          ))}
        </select>
        <p className="small muted">{shown.length} ta keys</p>
      </Card>
      <div className="grid grid--3 mt-5">
        {shown.map(item => (
          <Link key={item.id} to={catalog + '&keys=' + item.id + (topic ? '&mavzu=' + topic : '')} className="card card--pad case-tile" onClick={() => window.scrollTo(0, 0)}>
            <span className="case-tile__number"><BookOpen size={17} aria-hidden /> {item.id}-keys</span>
            <strong>{item.title}</strong>
            <span className="small muted">{topicName(item.topic)}</span>
            <ChevronRight size={18} aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}

function CaseSolution({ id }: { id: number }) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<{ solution: string; conclusion: string }>();

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_unlock_case', { case_id: id, access_code: code });
    setBusy(false);
    if (data?.status === 'ok') { setAnswer(data); setCode(''); }
    else if (data?.status === 'wrong') setMessage('Kod xato.');
    else if (data?.status === 'wait') setMessage('Urinishlar chegarasiga yetdingiz. 15 daqiqadan keyin qayta urinib ko‘ring.');
    else setMessage(error ? 'Yechimni yuklab bo‘lmadi. Qayta urinib ko‘ring.' : 'Yechim hozircha mavjud emas.');
  }

  if (!user) return <Card title="Yechim va xulosa"><Button to={paths.login}>Kabinetga kirish</Button></Card>;
  return answer ? (
    <Card title="Yechim va xulosa" className="case-reading">
      <div className="case-text">
        <h3><UnlockKeyhole size={17} aria-hidden /> Yechim</h3>
        <SolutionSteps text={answer.solution} />
        <h3>Xulosa</h3>
        <p>{answer.conclusion.replace(/^Xulosa[.:]?\s*/i, '')}</p>
      </div>
    </Card>
  ) : (
    <Card title="Yechim va xulosa">
      <form className="stack" onSubmit={event => void unlock(event)}>
        <label htmlFor="case-code"><LockKeyhole size={16} aria-hidden /> O‘qituvchi bergan kod</label>
        <input id="case-code" className="search-control" type="password" autoComplete="off" inputMode="numeric"
          maxLength={5} pattern="[0-9]{5}" required value={code} onChange={event => setCode(event.target.value)} />
        <Button disabled={busy || code.length !== 5} type="submit">Yechimni ochish</Button>
        {message && <p role="status">{message}</p>}
      </form>
    </Card>
  );
}

function SolutionSteps({ text }: { text: string }) {
  return (
    <div className="stack">
      {text.replace(/^Yechim[.:]?\s*/i, '').split(/(?=^\d+\s*[-–.]\s*topshiriq\s+yechimi\b)/gimu).filter(Boolean).map((part, index) => {
        const step = part.match(/^(\d+\s*[-–.]\s*topshiriq\s+yechimi)[.:]?\s*/iu);
        return (
          <section className="case-step" key={index}>
            {step && <h4>{step[1]}</h4>}
            <p>{step ? part.slice(step[0].length) : part}</p>
          </section>
        );
      })}
    </div>
  );
}
