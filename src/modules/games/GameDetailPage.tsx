import { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Notice, PageHeader } from '@/components/ui';
import { topicGameBank, type GameConcept } from '@/data/topicGames';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';

const gameTypes = {
  moslashtirish: { title: 'Tushunchalarni moslashtirish', other: 'vaziyatli-qaror' },
  'vaziyatli-qaror': { title: 'Vaziyatni tahlil qiling', other: 'moslashtirish' },
} as const;
const taskCount = 10;
const pairStyle = { whiteSpace: 'normal', height: 'auto', minHeight: 48, paddingBlock: 10, lineHeight: 1.35, textAlign: 'left', justifyContent: 'flex-start' } as const;

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function GameDetailPage() {
  const { slug = '' } = useParams();
  const [params] = useSearchParams();
  const topicId = params.get('mavzu');
  const topic = topicId ? catalogService.getTopic(topicId) : null;
  if (!topic || (slug !== 'moslashtirish' && slug !== 'vaziyatli-qaror')) {
    return <Navigate to={paths.games + (topic ? '?mavzu=' + topic.id : '')} replace />;
  }

  const concepts = topicGameBank[topic.globalOrder - 1];
  const mode = gameTypes[slug];
  const matching = slug === 'moslashtirish';
  return (
    <div className="container page">
      <PageHeader
        crumbs={[{ label: 'O‘yinlar', to: paths.games + '?mavzu=' + topic.id }, { label: mode.title }]}
        eyebrow={topic.globalOrder + '-mavzu'} title={mode.title} description={topic.title}
        badges={<Badge tone="info">10 ta topshiriq</Badge>}
        actions={<Button variant="secondary" to={paths.topic(topic.id)}>Mavzuga qaytish</Button>}
      />
      <div className="stack">
        <GameSession key={topic.id + ':' + slug} concepts={concepts} matching={matching} />
        <div><Button variant="secondary" to={paths.game(mode.other) + '?mavzu=' + topic.id}>
          {gameTypes[mode.other].title}
        </Button></div>
      </div>
    </div>
  );
}

function GameSession({ concepts, matching }: { concepts: readonly GameConcept[]; matching: boolean }) {
  const [attempt, setAttempt] = useState(0);
  return matching ? (
    <MatchingGame key={attempt} concepts={concepts} restart={() => setAttempt((n) => n + 1)} />
  ) : (
    <SituationGame key={attempt} concepts={concepts} restart={() => setAttempt((n) => n + 1)} />
  );
}

function Score({ score, restart }: { score: number; restart: () => void }) {
  return (
    <Card title="O‘yin yakunlandi">
      <div className="stack">
        <p role="status"><strong>{score} / {taskCount}</strong> to‘g‘ri · {score * 10}%</p>
        <p>{score === taskCount ? 'Barcha topshiriqlar to‘g‘ri bajarildi.' : 'Mavzuni takrorlab, natijangizni yaxshilab ko‘ring.'}</p>
        <div><Button onClick={restart}>Qayta o‘ynash</Button></div>
      </div>
    </Card>
  );
}

function MatchingGame({ concepts, restart }: { concepts: readonly GameConcept[]; restart: () => void }) {
  const [round, setRound] = useState(0);
  const [ordering] = useState(() => Array.from({ length: 2 }, () => ({
    left: shuffle(concepts.map((_, i) => i)), right: shuffle(concepts.map((_, i) => i)),
  })));
  const [picked, setPicked] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const roundScore = Object.entries(pairs).filter(([left, right]) => Number(left) === right).length;
  if (round === 2) return <Score score={score} restart={restart} />;
  const { left, right } = ordering[round];

  function assign(candidate: number) {
    if (picked === null || checked) return;
    setPairs((current) => {
      const updated = { ...current };
      const usedBy = Object.keys(updated).find((key) => updated[Number(key)] === candidate);
      if (usedBy !== undefined) delete updated[Number(usedBy)];
      updated[picked] = candidate;
      return updated;
    });
    setPicked(null);
  }

  function advance() {
    setScore(score + roundScore);
    setRound(round + 1);
    setPairs({});
    setPicked(null);
    setChecked(false);
  }

  return (
    <Card title={'Moslashtirish · ' + (round + 1) + '/2-bosqich'}>
      <div className="stack">
        <p>{round === 0 ? 'Chapdan atamani, o‘ngdan uning ta’rifini tanlang.' : 'Chapdan ta’rifni, o‘ngdan unga mos atamani tanlang.'} Besh juftlikni belgilang.</p>
        <progress value={round * 5 + Object.keys(pairs).length} max={taskCount} aria-label="Bajarilgan topshiriqlar" />
        <div className="grid grid--2">
          <div className="stack stack--sm" aria-label="Birinchi ustun">
            {left.map((id, i) => (
              <Button key={id} block style={pairStyle} aria-pressed={picked === id} variant={picked === id ? 'primary' : 'secondary'} disabled={checked} onClick={() => setPicked(id)}>
                {i + 1}. {concepts[id][round === 0 ? 0 : 1]}
                {pairs[id] !== undefined && ' → ' + String.fromCharCode(65 + right.indexOf(pairs[id]))}
              </Button>
            ))}
          </div>
          <div className="stack stack--sm" aria-label="Ikkinchi ustun">
            {right.map((id, i) => (
              <Button key={id} block style={pairStyle} variant="secondary" disabled={checked || picked === null} onClick={() => assign(id)}>
                {String.fromCharCode(65 + i)}. {concepts[id][round === 0 ? 1 : 0]}
              </Button>
            ))}
          </div>
        </div>
        {checked && (
          <Notice kind="info" title={roundScore + ' / 5 juftlik to‘g‘ri'}>
            <ul className="dots">
              {left.map((id, i) => <li key={id}>{i + 1}. {pairs[id] === id ? 'To‘g‘ri' : 'Xato'} · {concepts[id][0]} — {concepts[id][1]}</li>)}
            </ul>
          </Notice>
        )}
        <div>{checked ? (
          <Button onClick={advance}>{round === 0 ? 'Keyingi bosqich' : 'Natijani ko‘rish'}</Button>
        ) : (
          <Button disabled={Object.keys(pairs).length !== concepts.length} onClick={() => { setChecked(true); setPicked(null); }}>Juftliklarni tekshirish</Button>
        )}</div>
      </div>
    </Card>
  );
}

function SituationGame({ concepts, restart }: { concepts: readonly GameConcept[]; restart: () => void }) {
  const [questions] = useState(() => [false, true].flatMap((reverse) => shuffle(concepts.map((concept, answer) => ({
    prompt: reverse ? 'Qaysi vaziyat ushbu tushunchaga mos? ' + concept[0] : 'Vaziyatga mos tushunchani toping. ' + concept[2],
    answer,
    choices: shuffle([answer, ...shuffle(concepts.map((_, i) => i).filter((i) => i !== answer)).slice(0, 3)]),
    column: reverse ? 2 : 0,
  })))));
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  if (index === questions.length) return <Score score={score} restart={restart} />;
  const question = questions[index];
  return (
    <Card title={'Vaziyat · ' + (index + 1) + ' / ' + taskCount}>
      <div className="stack">
        <progress value={index + Number(checked)} max={taskCount} aria-label="Bajarilgan topshiriqlar" />
        <p><strong>{question.prompt}</strong></p>
        <fieldset className="stack stack--sm" style={{ border: 0, padding: 0 }} disabled={checked}>
          <legend>Javob variantlari</legend>
          {question.choices.map((id) => (
            <label key={id} className="slot">
              <input type="radio" name="situation-answer" checked={choice === id} onChange={() => setChoice(id)} />
              <span>{concepts[id][question.column]}</span>
            </label>
          ))}
        </fieldset>
        {checked && (
          <Notice kind="info" title={choice === question.answer ? 'To‘g‘ri!' : 'Xato javob'}>
            <p><strong>{concepts[question.answer][0]}</strong> — {concepts[question.answer][1]}.</p>
            {question.column === 2 && <p>{concepts[question.answer][2]}.</p>}
          </Notice>
        )}
        <div>{checked ? (
          <Button onClick={() => { setIndex(index + 1); setChoice(null); setChecked(false); }}>
            {index + 1 === taskCount ? 'Natijani ko‘rish' : 'Keyingi savol'}
          </Button>
        ) : (
          <Button disabled={choice === null} onClick={() => { setChecked(true); if (choice === question.answer) setScore(score + 1); }}>Javobni tekshirish</Button>
        )}</div>
      </div>
    </Card>
  );
}
