import { useState } from 'react';
import { Button, Card, PageHeader } from '@/components/ui';
import { catalogService } from '@/services/catalog.service';
import { useAuth } from '@/services/auth/AuthContext';
import { supabase } from '@/services/supabase';
import { paths } from '@/navigation/paths';

interface Attempt {
  id: string;
  questions: { question: string; options: string[] }[];
}

export function TestsPage({ initialTopic }: { initialTopic?: number }) {
  const { user } = useAuth();
  const [topic, setTopic] = useState(initialTopic?.toString() ?? '');
  const [attempt, setAttempt] = useState<Attempt>();
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File>();
  const topics = catalogService.getTopics().data;

  async function startTest() {
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_start_test', {
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
    setAnswers(data.questions.map(() => -1));
    setScore(undefined);
  }

  async function submitTest() {
    if (!attempt) return;
    setBusy(true);
    setMessage('');
    const { data, error } = await supabase.rpc('econ_submit_test', { attempt_id: attempt.id, answers });
    setBusy(false);
    if (error) setMessage('Javoblarni yuborishda xatolik yuz berdi.');
    else setScore(data);
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
        {!user && <Card><p>Test boshlash uchun kabinetingizga kiring.</p></Card>}
        {user && !attempt && (
          <Card title="Testni boshlash">
            <div className="stack">
              <label htmlFor="test-topic">Savollar banki</label>
              <select id="test-topic" value={topic} onChange={(event) => setTopic(event.target.value)}>
                <option value="">Umumiy test</option>
                {topics.map((item) => <option key={item.id} value={item.globalOrder}>{item.globalOrder}. {item.title}</option>)}
              </select>
              <Button disabled={busy} onClick={() => void startTest()}>Boshlash</Button>
            </div>
          </Card>
        )}
        {attempt && score === undefined && (
          <>
            {attempt.questions.map((item, index) => (
              <Card key={index}>
                <fieldset className="stack">
                  <legend>{index + 1}. {item.question}</legend>
                  {item.options.map((option, choice) => (
                    <label key={choice}>
                      <input type="radio" name={`item-${index}`} checked={answers[index] === choice}
                        disabled={busy}
                        onChange={() => setAnswers((previous) => previous.map((value, position) => position === index ? choice : value))} />
                      {' '}{option}
                    </label>
                  ))}
                </fieldset>
              </Card>
            ))}
            <Button disabled={busy || answers.includes(-1)} onClick={() => void submitTest()}>Natijani hisoblash</Button>
          </>
        )}
        {attempt && score !== undefined && (
          <Card title="Natija">
            <p>{attempt.questions.length} savoldan {score} tasi to‘g‘ri.</p>
            <Button onClick={() => setAttempt(undefined)}>Yangi test</Button>
          </Card>
        )}
        {user?.role === 'admin' && !attempt && (
          <Card title="Savollar bankini yuklash">
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
