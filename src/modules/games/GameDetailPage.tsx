import { useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Notice, PageHeader } from '@/components/ui';
import { topicGameBank, type GameConcept } from '@/data/topicGames';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';
import { useRecordGame } from './recordGame';

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
        <GameSession key={topic.id + ':' + slug} concepts={concepts} matching={matching} topic={topic.globalOrder} />
        <div><Button variant="secondary" to={paths.game(mode.other) + '?mavzu=' + topic.id}>
          {gameTypes[mode.other].title}
        </Button></div>
      </div>
    </div>
  );
}

function GameSession({ concepts, matching, topic }: { concepts: readonly GameConcept[]; matching: boolean; topic: number }) {
  const [attempt, setAttempt] = useState(0);
  return matching ? (
    <MatchingGame key={attempt} topic={topic} concepts={concepts} restart={() => setAttempt((n) => n + 1)} />
  ) : (
    <SituationGame key={attempt} topic={topic} concepts={concepts} restart={() => setAttempt((n) => n + 1)} />
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

function MatchingGame({ concepts, restart, topic }: { concepts: readonly GameConcept[]; restart: () => void; topic: number }) {
  const record = useRecordGame();
  const [round, setRound] = useState(0);
  const [ordering] = useState(() => Array.from({ length: 2 }, () => ({
    left: shuffle(concepts.map((_, i) => i)), right: shuffle(concepts.map((_, i) => i)),
  })));
  const [picked, setPicked] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const roundScore = Object.entries(pairs).filter(([left, right]) => Number(left) === right).length;
  const board = useRef<HTMLDivElement>(null);
  const [arrows, setArrows] = useState<{ id: number; path: string; color: string }[]>([]);
  useLayoutEffect(() => {
    const element = board.current;
    if (!element) return;
    const refresh = () => {
      const bounds = element.getBoundingClientRect();
      setArrows(Object.entries(pairs).flatMap(([id, target]) => {
        const left = element.querySelector(`[data-left="${id}"]`)?.getBoundingClientRect();
        const right = element.querySelector(`[data-right="${target}"]`)?.getBoundingClientRect();
        if (!left || !right) return [];
        const x1 = left.right - bounds.left;
        const x2 = right.left - bounds.left - 5;
        const y1 = left.top + left.height / 2 - bounds.top;
        const y2 = right.top + right.height / 2 - bounds.top;
        const mid = (x1 + x2) / 2;
        const color = checked ? (Number(id) === target ? '#26735b' : '#a54e32') : '#476e92';
        return [{ id: Number(id), color, path: `M${x1} ${y1} C${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}` }];
      }));
    };
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(element);
    element.querySelectorAll('button').forEach(button => observer.observe(button));
    return () => observer.disconnect();
  }, [pairs, checked, round]);
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
        <div className="matching-board" ref={board}>
          <svg className="matching-arrows" aria-hidden="true">
            {arrows.map(arrow => <g key={arrow.id}>
              <marker id={`pair-arrow-${arrow.id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0L10 5 0 10Z" fill={arrow.color} />
              </marker>
              <path d={arrow.path} fill="none" stroke={arrow.color} strokeWidth="2" markerEnd={`url(#pair-arrow-${arrow.id})`} />
            </g>)}
          </svg>
          <div className="stack stack--sm" aria-label="Birinchi ustun">
            {left.map((id, i) => (
              <Button key={id} data-left={id} block style={pairStyle} aria-pressed={picked === id} variant={picked === id ? 'primary' : 'secondary'} disabled={checked} onClick={() => setPicked(id)}>
                {i + 1}. {concepts[id][round === 0 ? 0 : 1]}
                {pairs[id] !== undefined && ' → ' + String.fromCharCode(65 + right.indexOf(pairs[id]))}
              </Button>
            ))}
          </div>
          <div className="stack stack--sm" aria-label="Ikkinchi ustun">
            {right.map((id, i) => (
              <Button key={id} data-right={id} block style={pairStyle} variant="secondary" disabled={checked || picked === null} onClick={() => assign(id)}>
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
          <Button disabled={Object.keys(pairs).length !== concepts.length} onClick={() => {
            record('matching', topic, left.map(id => ({
              question: (round === 0 ? 'Ta’rifni moslang · ' : 'Atamani moslang · ') + concepts[id][round === 0 ? 0 : 1],
              correct: pairs[id] === id,
            })));
            setChecked(true); setPicked(null);
          }}>Juftliklarni tekshirish</Button>
        )}</div>
      </div>
    </Card>
  );
}

function SituationGame({ concepts, restart, topic }: { concepts: readonly GameConcept[]; restart: () => void; topic: number }) {
  const record = useRecordGame();
  const [questions] = useState(() => [false, true].flatMap(reverse => shuffle(concepts.map((_, answer) => {
    const alternatives = shuffle(concepts.map((_, id) => id).filter(id => id !== answer)).slice(0, 2);
    return { answer, reverse, terms: shuffle([answer, ...alternatives]), evidence: shuffle([answer, ...alternatives]) };
  }))));
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState<{ term?: number; evidence?: number }>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = questions[index];
  if (!question) return <Score score={score} restart={restart} />;

  const { answer, reverse } = question;
  const evidenceField = reverse ? 2 : 1;
  const evidenceLabel = reverse ? 'Amaliy misol' : 'Asoslovchi ta’rif';
  const complete = slots.term !== undefined && slots.evidence !== undefined;
  const correct = slots.term === answer && slots.evidence === answer;

  function place(kind: 'term' | 'evidence', id: number) {
    if (!checked) setSlots(previous => ({ ...previous, [kind]: id }));
  }

  return (
    <Card title={`Tahlil doskasi · ${index + 1} / ${questions.length}`}>
      <div className="stack">
        <progress value={index + Number(checked)} max={questions.length} aria-label="Bajarilgan topshiriqlar" />
        <div className="situation-clue">
          <small>{reverse ? 'Nazariy belgi' : 'Amaliy vaziyat'}</small>
          <p>{concepts[answer][reverse ? 1 : 2]}</p>
        </div>
        <p>Kartani bosing yoki mos katakka sudrang. Tekshirishdan oldin kartalarni almashtirish mumkin.</p>
        <div className="situation-desk">
          {(['term', 'evidence'] as const).map(kind => {
            const selected = slots[kind];
            const label = kind === 'term' ? 'Iqtisodiy tushuncha' : evidenceLabel;
            const field = kind === 'term' ? 0 : evidenceField;
            return (
              <div key={kind} className="stack stack--sm">
                <div className={`situation-slot${checked ? selected === answer ? ' is-correct' : ' is-wrong' : ''}`}
                  onDragOver={event => { if (!checked) event.preventDefault(); }}
                  onDrop={event => {
                    event.preventDefault();
                    const value = event.dataTransfer.getData('text/plain');
                    const [type, id] = value.split(':');
                    if (type === kind && question[kind === 'term' ? 'terms' : 'evidence'].includes(Number(id))) place(kind, Number(id));
                  }}>
                  <strong>{label}</strong>
                  <p>{selected === undefined ? 'Kartani shu yerga qo‘ying' : concepts[selected][field]}</p>
                </div>
                {question[kind === 'term' ? 'terms' : 'evidence'].map(id =>
                  <button key={id} type="button" className="test-option situation-card" disabled={checked}
                    aria-pressed={selected === id} draggable={!checked}
                    onDragStart={event => event.dataTransfer.setData('text/plain', kind + ':' + id)}
                    onClick={() => place(kind, id)}>{concepts[id][field]}</button>
                )}
              </div>
            );
          })}
        </div>
        {checked && <Notice kind="info" title={correct ? 'Tahlil to‘g‘ri' : 'Tahlilni solishtiring'}>
          <p><strong>{concepts[answer][0]}</strong> · {concepts[answer][1]}</p>
          <p>{concepts[answer][2]}</p>
        </Notice>}
        {checked ? (
          <Button onClick={() => { setIndex(index + 1); setSlots({}); setChecked(false); }}>
            {index === questions.length - 1 ? 'Natijani ko‘rish' : 'Keyingi vaziyat'}
          </Button>
        ) : <Button disabled={!complete} onClick={() => {
          if (correct) setScore(score + 1);
          record('situation', topic, [{ question: concepts[answer][reverse ? 1 : 2], correct }]);
          setChecked(true);
        }}>Tahlilni tekshirish</Button>}
      </div>
    </Card>
  );
}
