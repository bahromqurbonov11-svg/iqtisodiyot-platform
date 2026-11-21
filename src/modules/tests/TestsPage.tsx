import { useEffect, useRef, useState } from 'react';
import { Clock, ListChecks, TimerOff } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';

interface Attempt {
  id: string;
  deadline?: string;
  questions: { question: string; options: string[] }[];
}

export function TestsPage({ initialTopic }: { initialTopic?: number }) {
  const { user } = useAuth();
  const access = useTopicAccess();
  if (initialTopic && !access.allows(initialTopic)) {
    return <TopicAccessNotice pending={access.maximum === null} failed={access.failed} />;
  }
  return <TestSession key={user?.id ?? 'guest'} initialTopic={initialTopic} />;
}

type Draft = { attempt: Attempt; index: number; deadline: number; answers: number[] };

function TestSession({ initialTopic }: { initialTopic?: number }) {
  const { user } = useAuth();
  const access = useTopicAccess();
  const storageKey = user ? 'econ-test-draft:' + user.id : undefined;
  const [draft] = useState<Draft | undefined>(() => {
    if (!storageKey) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null') as Draft | null;
      if (saved?.attempt?.questions.length &&
          (saved.attempt.deadline ? saved.answers.length === saved.index : saved.answers.length === saved.attempt.questions.length) &&
          Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= saved.attempt.questions.length &&
          Number.isFinite(saved.deadline)) return saved;
    } catch { /* The test can still run without browser storage. */ }
  });
  const [topic, setTopic] = useState(initialTopic?.toString() ?? '');
  const [index, setIndex] = useState(draft?.index ?? 0);
  const [picked, setPicked] = useState<number | null>(null);
  const pickTimer = useRef<number | undefined>(undefined);
  const resolving = useRef(false);
  const [deadline, setDeadline] = useState(draft?.deadline ?? 0);
  const [seconds, setSeconds] = useState(() => draft ? Math.max(0, Math.ceil((draft.deadline - Date.now()) / 1000)) : 90);
  const [count, setCount] = useState('20');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const broad = !topic || topic.startsWith('-');
  const topicLocked = !broad && !access.allows(Number(topic));
  const available = counts[topic || 'all'];
  const selectedCount = count === 'all' ? available : Number(count);
  const totalSeconds = (selectedCount ?? 0) * 90;

  useEffect(() => {
    if (user) void supabase.rpc('econ_test_counts').then(({ data }) => { if (data) setCounts(data); });
  }, [user, access.maximum]);
  const [attempt, setAttempt] = useState<Attempt | undefined>(draft?.attempt);
  const [answers, setAnswers] = useState<number[]>(draft?.answers ?? []);
  const [score, setScore] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File>();
  const topics = catalogService.getTopics().data;

  function saveDraft(value?: Draft) {
    if (!storageKey) return;
    try {
      if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
      else sessionStorage.removeItem(storageKey);
    } catch { /* The current attempt remains available in memory. */ }
  }

  useEffect(() => {
    if (!attempt || index >= attempt.questions.length || !deadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining && !resolving.current) {
        resolving.current = true;
        void advance(4);
      }
    };
    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [attempt, index, deadline]);

  useEffect(() => () => window.clearTimeout(pickTimer.current), []);

  /** Javob tanlanganda belgi ko‘rinib turadi, so‘ng savol silliq almashadi. */
  function choose(choice: number) {
    if (!attempt || resolving.current) return;
    resolving.current = true;
    if (attempt.deadline) {
      setPicked(choice);
      void advance(choice);
      return;
    }
    const final = Date.now() >= deadline ? 4 : choice;
    const nextAnswers = answers.map((value, position) => position === index ? final : value);
    setAnswers(nextAnswers);
    saveDraft({ attempt, answers: nextAnswers, index: index + 1, deadline: Date.now() + 90_520 });
    setPicked(choice);
    pickTimer.current = window.setTimeout(() => void advance(final), 520);
  }

  async function advance(choice: number) {
    if (!attempt) return;
    window.clearTimeout(pickTimer.current);
    setPicked(null);
    let nextAnswers = answers.map((value, position) => position === index ? choice : value);
    let nextDeadline = Date.now() + 90_000;
    let nextIndex = index + 1;
    if (attempt.deadline) {
      const { data, error } = await supabase.rpc('econ_record_timed_answer', {
        attempt_id: attempt.id, question_index: index, choice,
      });
      if (error || !Array.isArray(data?.answers)) {
        setMessage('Javobni saqlab bo‘lmadi. Qayta urining.');
        setDeadline(0);
        resolving.current = false;
        return;
      }
      setMessage('');
      nextAnswers = data.answers;
      nextIndex = nextAnswers.length;
      nextDeadline = Date.parse(data.deadline);
    }
    setAnswers(nextAnswers);
    setIndex(nextIndex);
    setDeadline(nextDeadline);
    setSeconds(Math.max(0, Math.ceil((nextDeadline - Date.now()) / 1000)));
    saveDraft({ attempt, answers: nextAnswers, index: nextIndex, deadline: nextDeadline });
    resolving.current = false;
  }

  async function startTest() {
    if (topicLocked) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_start_selected_test', {
      question_limit: broad ? (count === 'all' ? null : Number(count)) : 20,
      wanted_topic: topic ? Number(topic) : null,
    });
    setBusy(false);
    if (error) {
      setMessage('Testni boshlashda xatolik yuz berdi.');
      return;
    }
    if (!data?.questions?.length) {
      setMessage('Bu tanlov uchun savol mavjud emas.');
      return;
    }
    setAttempt(data);
    setPicked(null);
    setIndex(0);
    setSeconds(90);
    const nextDeadline = data.deadline ? Date.parse(data.deadline) : Date.now() + 90_000;
    const nextAnswers = data.deadline ? [] : data.questions.map(() => -1);
    resolving.current = false;
    setDeadline(nextDeadline);
    setAnswers(nextAnswers);
    saveDraft({ attempt: data, index: 0, deadline: nextDeadline, answers: nextAnswers });
    setScore(undefined);
  }

  async function submitTest() {
    if (!attempt) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_submit_test', { attempt_id: attempt.id, answers });
    setBusy(false);
    if (error) setMessage('Javoblarni yuborishda xatolik yuz berdi.');
    else { saveDraft(); setScore(data); access.refresh(); }
  }

  async function importBank() {
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      const items: unknown = JSON.parse(await file.text());
      if (!Array.isArray(items) || !items.length) throw new Error();
      const { data, error } = await supabase.rpc('econ_import_test_bank', { items });
      if (error) throw error;
      setMessage(`${data} ta savol bankka yozildi.`);
    } catch {
      setMessage('Savollar bankini yuklab bo‘lmadi. Fayl va admin ruxsatini tekshiring.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'Testlar' }]}
        title="Iqtisodiyot nazariyasi testlari"
        description="Umumiy testni boshlang yoki bir mavzu bo‘yicha mashq qiling."
      />
      <div className="stack">
        {!user && <GuestTest initialTopic={initialTopic} />}
        {user && !attempt && (
          <Card title="Testni boshlash" subtitle="Savollar bankini tanlang va testni boshlang" className="test-start">
            <div className="stack">
              <label htmlFor="test-topic">Savollar banki</label>
              <select className="search-control" id="test-topic" value={topic} onChange={(event) => { setTopic(event.target.value); setCount('20'); }}>
                <option value="">Umumiy test</option>
                <option value="-1">1-semestr</option>
                <option value="-2">2-semestr</option>
                <optgroup label="Mavzular">
                {topics.map((item) => <option key={item.id} value={item.globalOrder} disabled={!access.allows(item.globalOrder)}>
                  {item.globalOrder}. {item.title}{access.allows(item.globalOrder) ? '' : ' · Yopiq'}
                </option>)}
                </optgroup>
              </select>
              {broad && (
                <>
                  <label htmlFor="question-count">Savollar soni</label>
                  <select className="search-control" id="question-count" value={count} onChange={event => setCount(event.target.value)}>
                    {[10, 15, 20, 30, 50, 100, 200].filter(size => available === undefined || size <= available).map(size => <option key={size}>{size}</option>)}
                    <option value="all">Barcha savollar{available !== undefined ? ` (${available} ta)` : ""}</option>
                  </select>
                  <p className="small muted">Jami vaqt: {Math.floor(totalSeconds / 60)} daqiqa {totalSeconds % 60 ? ` ${totalSeconds % 60} soniya` : ""}</p>
                </>
              )}
              <ul className="test-pills" aria-label="Test shartlari">
                <li><ListChecks size={16} aria-hidden /> {broad ? (selectedCount !== undefined ? selectedCount + ' ta savol' : 'Savollar soni tanlanadi') : 'Mavzu bo‘yicha 20 tagacha savol'}</li>
                <li><Clock size={16} aria-hidden /> Har bir savolga 90 soniya</li>
                <li><TimerOff size={16} aria-hidden /> Vaqt tugasa — javob xato hisoblanadi</li>
              </ul>
              <Button disabled={busy || topicLocked} onClick={() => void startTest()}>Boshlash</Button>
            </div>
          </Card>
        )}
        {attempt && score === undefined && (
          <>
            {index < attempt.questions.length ? (
              <Card className="test-question" key={index}>
                <div className="test-meta"><strong>{index + 1} / {attempt.questions.length}</strong><span aria-label="Qolgan vaqt" className={seconds <= 15 ? 'is-urgent' : ''}>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span></div>
                <div className="test-progress" aria-hidden><i style={{ width: (100 * index / attempt.questions.length) + '%' }} /></div>
                <h2>{attempt.questions[index].question}</h2>
                <div className="stack">
                  {attempt.questions[index].options.map((option, choice) => (
                    <button type="button" className={'test-option' + (picked === choice ? ' is-picked' : picked !== null ? ' is-dim' : '')} key={index + '-' + choice} disabled={picked !== null && picked !== choice} aria-pressed={picked === choice} onClick={() => choose(choice)}><b aria-hidden>{String.fromCharCode(65 + choice)}</b><span>{option}</span></button>
                  ))}
                </div>
              </Card>
            ) : <Button disabled={busy} onClick={() => void submitTest()}>Natijani hisoblash</Button>}
          </>
        )}
        {attempt && score !== undefined && (
          <Card title="Natija" className="test-result">
            <div className="test-score" role="img" aria-label={'Natija ' + Math.round(100 * score / attempt.questions.length) + ' foiz'}>
              <b>{Math.round(100 * score / attempt.questions.length)}%</b><span>{score} / {attempt.questions.length}</span>
            </div>
            <p>{score} ta to‘g‘ri · {attempt.questions.length - score} ta xato</p>
            <p>{answers.filter(choice => choice === 4).length} ta belgilanmagan (xato hisoblandi)</p>
            <Button onClick={() => setAttempt(undefined)}>Yangi test</Button>
          </Card>
        )}
        {user?.role === 'admin' && !attempt && (
          <Card title="Savollar bankini yuklash" className="test-bank">
            <div className="stack">
              <label htmlFor="test-bank-file">Tayyorlangan savollar banki (.json)</label>
              <input id="test-bank-file" type="file" accept=".json" onChange={(event) => setFile(event.target.files?.[0])} />
              <Button disabled={busy || !file} onClick={() => void importBank()}>Bankka yuklash</Button>
            </div>
          </Card>
        )}
        {message && <p role="status">{message}</p>}
      </div>
    </div>
  );
}
import { GuestTest } from './GuestTest';
import { TopicAccessNotice, useTopicAccess } from '@/services/TopicAccess';
