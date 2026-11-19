import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { topicGameBank } from '@/data/topicGames';
import { catalogService } from '@/services/catalog.service';
import { paths } from '@/navigation/paths';

export function GuestTest({ initialTopic }: { initialTopic?: number }) {
  const [topic, setTopic] = useState(initialTopic ?? 1);
  const [index, setIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const topics = catalogService.getTopics().data;
  const bank = topicGameBank[topic - 1];
  const question = bank[index];
  return <Card title="3 savollik qisqa test">
    <div className="stack">
      {index < 0 ? <>
        <label>Mavzu<select className="search-control" value={topic} onChange={event => setTopic(Number(event.target.value))}>
          {topics.map(t => <option key={t.id} value={t.globalOrder}>{t.globalOrder}. {t.title}</option>)}
        </select></label>
        <Button onClick={() => { setScore(0); setIndex(0); }}>Sinab ko‘rish</Button>
      </> : index < 3 ? <>
        <strong>{index + 1} / 3 · {question[1]}</strong>
        {[index, (index + 1) % bank.length, (index + 2) % bank.length].sort((a,b) => (a + topic) % 3 - (b + topic) % 3).map(id => (
          <button type="button" key={id} className="test-option" onClick={() => {
            if (id === index) setScore(value => value + 1);
            setIndex(index + 1);
          }}>{bank[id][0]}</button>
        ))}
      </> : <>
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
