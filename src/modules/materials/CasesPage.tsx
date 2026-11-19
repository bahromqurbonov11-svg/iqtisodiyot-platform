import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight, LockKeyhole, UnlockKeyhole } from 'lucide-react';
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

  if (current) return (
    <div className="container page">
      <PageHeader crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Keyslar', to: catalog + (topic ? '&mavzu=' + topic : '') }, { label: current.id + '-keys' }]}
        eyebrow={current.topic + '-mavzu · ' + topicName(current.topic)} title={current.title} />
      <div className="case-layout">
        <Card title={current.id + '-keys'} className="case-reading">
          <div className="case-text">{current.body.map((line, index) => (
            /^(?:Topshiriqlar?|Vaziyat tavsifi|Vaziyat)[.:]?$/i.test(line) ? <h3 key={index}>{line.replace(/[.:]$/, '')}</h3> : <p key={index}>{line}</p>
          ))}</div>
        </Card>
        <CaseSolution key={current.id} id={current.id} />
      </div>
    </div>
  );

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
