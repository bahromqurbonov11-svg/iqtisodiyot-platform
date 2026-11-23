import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { topicGameBank } from '@/data/topicGames';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';
import { useTopicAccess } from '@/services/TopicAccess';
import { TestCopyGuard } from './TestCopyGuard';

export function GuestTest({ initialTopic }: { initialTopic?: number }) {
  const access = useTopicAccess();
  const [topic, setTopic] = useState(initialTopic ?? 1);
  const [index, setIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const topics = catalogService.getTopics().data;
  const bank = topicGameBank[topic - 1];
  const question = bank[index];
  return <Card title="3 savollik qisqa test">
    <div className="stack">
      {index < 0 || !access.allows(topic) ? <>
        <label>Mavzu<select className="search-control" value={topic} onChange={event => setTopic(Number(event.target.value))}>
          {topics.map(t => <option key={t.id} value={t.globalOrder} disabled={!access.allows(t.globalOrder)}>{t.globalOrder}. {t.title}</option>)}
        </select></label>
        <Button disabled={!access.allows(topic)} onClick={() => { setScore(0); setIndex(0); }}>Sinab ko‘rish</Button>
      </> : index < 3 ? <TestCopyGuard>
        <strong>{index + 1} / 3 · {question[1]}</strong>
        {[index, (index + 1) % bank.length, (index + 2) % bank.length].sort((a,b) => (a + topic) % 3 - (b + topic) % 3).map(id => (
          <button type="button" key={index + '-' + id} className={'test-option' + (picked === id ? ' is-picked' : picked !== null ? ' is-dim' : '')}
            disabled={picked !== null && picked !== id} onClick={() => {
              if (picked !== null) return;
              setPicked(id);
              timer.current = window.setTimeout(() => {
                if (id === index) setScore(value => value + 1);
                setPicked(null);
                setIndex(index + 1);
              }, 520);
            }}>{bank[id][0]}</button>
        ))}
      </TestCopyGuard> : <>
        <strong>Natija: {score} / 3</strong>
        <p>Natijalarni saqlash va to‘liq test ishlash uchun ro‘yxatdan o‘ting.</p>
        <div className="presentation-actions">
          <Button to={paths.register}>Ro‘yxatdan o‘tish</Button>
          <Button to={paths.login} variant="secondary">Kirish</Button>
          <Button variant="secondary" onClick={() => setIndex(-1)}>Boshqa mavzu</Button>
        </div>
      </>}
    </div>
  </Card>;
}
