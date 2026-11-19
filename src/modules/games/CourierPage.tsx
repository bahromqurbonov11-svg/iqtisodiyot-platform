import { useEffect, useReducer, useRef } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Clock3, MapPin, Package, Truck } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { topicGameBank } from '@/data/topicGames';
import { paths } from '@/navigation/paths';

const columns = 9;
const rows = 6;
const warehouse = 18;
const destinations = [8, 53, 7, 45, 4, 50, 17, 52];
const roadworks = new Set([3, 12, 16, 23, 29, 32, 37, 41]);
const directions = [
  { key: 'ArrowUp', label: 'Yuqoriga', x: 0, y: -1, Icon: ArrowUp },
  { key: 'ArrowLeft', label: 'Chapga', x: -1, y: 0, Icon: ArrowLeft },
  { key: 'ArrowDown', label: 'Pastga', x: 0, y: 1, Icon: ArrowDown },
  { key: 'ArrowRight', label: 'O‘ngga', x: 1, y: 0, Icon: ArrowRight },
];

function makeQuestion() {
  const bank = topicGameBank[Math.floor(Math.random() * topicGameBank.length)];
  const answer = Math.floor(Math.random() * bank.length);
  const choices = bank.map(([name], index) => ({ name, correct: index === answer }));
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { prompt: bank[answer][1], choices };
}

type Phase = 'ready' | 'running' | 'quiz' | 'over';
type State = {
  phase: Phase; position: number; carrying: boolean; delivered: number; remaining: number; deadline: number;
  question: ReturnType<typeof makeQuestion> | null; note: string;
};
type Action =
  | { type: 'start' | 'tick'; now: number }
  | { type: 'move'; x: number; y: number; now: number; question: State['question'] }
  | { type: 'answer'; correct: boolean; now: number };

const initial: State = { phase: 'ready', position: 27, carrying: false, delivered: 0, remaining: 90, deadline: 0, question: null, note: '' };

function reduce(state: State, action: Action): State {
  if (action.type === 'start') return { ...initial, phase: 'running', deadline: action.now + 90_000 };
  if (action.type === 'answer') {
    if (state.phase !== 'quiz') return state;
    const remaining = state.remaining + (action.correct ? 18 : 0);
    return { ...state, phase: 'running', question: null, remaining, deadline: action.now + remaining * 1000,
      note: action.correct ? 'To‘g‘ri! 18 soniya qo‘shildi.' : 'Xato javob. Yetkazishni davom ettiring.' };
  }
  if (state.phase !== 'running') return state;
  const remaining = Math.max(0, Math.ceil((state.deadline - action.now) / 1000));
  if (!remaining) return { ...state, phase: 'over', remaining: 0, note: '' };
  if (action.type !== 'move') return remaining === state.remaining ? state : { ...state, remaining };
  const x = state.position % columns + action.x;
  const y = Math.floor(state.position / columns) + action.y;
  if (x < 0 || x >= columns || y < 0 || y >= rows) return state;
  const position = y * columns + x;
  if (roadworks.has(position)) return { ...state, note: 'Yo‘l ta’mirlanmoqda. Boshqa yo‘ldan boring.' };
  if (!state.carrying && position === warehouse) return { ...state, position, carrying: true, note: 'Buyurtma olindi. Belgilangan manzilga boring.' };
  if (state.carrying && position === destinations[state.delivered % destinations.length]) {
    const delivered = state.delivered + 1;
    const deadline = state.deadline + 6_000;
    const next = { ...state, position, delivered, deadline, remaining: remaining + 6, carrying: false, note: 'Yetkazildi! 6 soniya qo‘shildi.' };
    return delivered % 5 === 0 ? { ...next, phase: 'quiz', question: action.question } : next;
  }
  return { ...state, position, remaining };
}

export function CourierPage() {
  const [state, dispatch] = useReducer(reduce, initial);
  const board = useRef<HTMLDivElement>(null);
  const destination = destinations[state.delivered % destinations.length];
  const move = (direction: typeof directions[number]) => dispatch({ type: 'move', x: direction.x, y: direction.y,
    now: Date.now(), question: state.carrying && (state.delivered + 1) % 5 === 0 &&
      state.position + direction.y * columns + direction.x === destination ? makeQuestion() : null });

  useEffect(() => {
    if (state.phase !== 'running') return;
    board.current?.focus({ preventScroll: true });
    const timer = window.setInterval(() => dispatch({ type: 'tick', now: Date.now() }), 200);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  return <div className="container page">
    <PageHeader title="Bozor kuryeri" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Bozor kuryeri' }]}
      description="Buyurtmani ombordan oling va belgilangan manzilga yetkazing. Yo‘l ta’miri bor kataklarni aylanib o‘ting." />
    <div className="grid grid--2-1">
      <Card className="courier-board-card">
        <div className="courier-hud">
          <strong><Clock3 size={18} aria-hidden /> {state.remaining} soniya</strong>
          <strong><Package size={18} aria-hidden /> {state.delivered} ta buyurtma</strong>
        </div>
        <div ref={board} className="courier-board" tabIndex={0} aria-label="Yetkazish xaritasi. Yo‘nalish tugmalaridan foydalaning"
          onKeyDown={event => {
            const direction = directions.find(item => item.key === event.key);
            if (direction) { event.preventDefault(); move(direction); }
          }}>
          {Array.from({ length: rows * columns }, (_, index) => {
            const blocked = roadworks.has(index);
            const target = index === (state.carrying ? destination : warehouse);
            return <div key={index} aria-hidden="true" className={`courier-cell${blocked ? ' is-blocked' : ''}${target ? ' is-target' : ''}`}>
              {index === state.position ? <Truck /> : index === warehouse ? <Package /> : target ? <MapPin /> : null}
            </div>;
          })}
        </div>
        <div className="courier-arrows" aria-label="Yo‘nalishlar">
          {directions.map(({ Icon, ...direction }) => <button key={direction.key} type="button" className="btn btn--secondary"
            disabled={state.phase !== 'running'} aria-label={direction.label} onClick={() => move({ ...direction, Icon })}><Icon size={19} /></button>)}
        </div>
      </Card>
      <Card title={state.phase === 'quiz' ? 'Bonus savol' : 'Yetkazish holati'}>
        <div className="stack">
          {state.phase === 'ready' && <Button onClick={() => dispatch({ type: 'start', now: Date.now() })}>Boshlash</Button>}
          {state.phase === 'running' && <strong>{state.carrying ? 'Belgisi bor manzilga boring' : 'Ombordan buyurtma oling'}</strong>}
          {state.phase === 'quiz' && state.question && <>
            <p>Ta’rifga mos tushunchani tanlang. Savol paytida vaqt to‘xtaydi.</p>
            <strong>{state.question.prompt}</strong>
            {state.question.choices.map((choice, index) => <button type="button" key={index} className="test-option"
              onClick={() => dispatch({ type: 'answer', correct: choice.correct, now: Date.now() })}>{choice.name}</button>)}
          </>}
          {state.phase === 'over' && <>
            <strong>Vaqt tugadi. {state.delivered} ta buyurtma yetkazildi.</strong>
            <Button onClick={() => dispatch({ type: 'start', now: Date.now() })}>Qayta o‘ynash</Button>
          </>}
          {!!state.note && state.phase === 'running' && <p role="status">{state.note}</p>}
          {state.phase !== 'quiz' && <p className="small muted">Har beshinchi yetkazmadan keyin savol chiqadi. To‘g‘ri javob 18 soniya qo‘shadi.</p>}
        </div>
      </Card>
    </div>
  </div>;
}
