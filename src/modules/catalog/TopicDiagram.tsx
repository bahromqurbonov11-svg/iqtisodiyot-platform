import { useEffect, useRef, useState } from 'react';
import {
  Store, Landmark, Building2, Package, Coins, ShoppingCart, House, Factory, Users, Wallet, Cog, TrendingUp,
  Ship, PenTool, CreditCard, Leaf, ShieldCheck, Activity, ArrowRight, type LucideIcon,
} from 'lucide-react';
import type { TopicVisual } from './TopicsPage';

/**
 * JONLI MAVZU GRAFIGI: grafik chizig‘i, ustunlar va qadamlar doimiy harakatda.
 * Qadamlar avtomatik almashadi; foydalanuvchi qadamni bossa, bir necha soniya shu qadamda to‘xtaydi.
 */
const diagramIcons: Partial<Record<number, { steps: [LucideIcon, LucideIcon, LucideIcon]; sequence?: boolean }>> = {
  3: { steps: [Store, Landmark, Building2] },
  4: { steps: [Package, Coins, ShoppingCart], sequence: true },
  5: { steps: [House, Factory, Store], sequence: true },
  7: { steps: [Users, Building2, Store] },
  10: { steps: [Wallet, Cog, ShoppingCart], sequence: true },
  14: { steps: [ShoppingCart, TrendingUp, Activity], sequence: true },
  20: { steps: [Landmark, CreditCard, ShoppingCart], sequence: true },
  21: { steps: [Factory, ShieldCheck, Leaf], sequence: true },
  23: { steps: [PenTool, Factory, Ship], sequence: true },
};

const X = [51, 150, 249];

export function TopicDiagram({ topicNumber, visual }: { topicNumber: number; visual: TopicVisual }) {
  const icons = diagramIcons[topicNumber];
  const [active, setActive] = useState(topicNumber % 3);
  const hold = useRef(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (Date.now() < hold.current) return;
      setActive((a) => (a + 1) % 3);
    }, 2400 + (topicNumber % 4) * 240);
    return () => window.clearInterval(timer);
  }, [topicNumber]);

  const pick = (i: number) => { hold.current = Date.now() + 9000; setActive(i); };
  const chart = visual.kind !== 'flow';
  const chartMax = Math.max(...visual.values, 1);
  const chartMin = visual.kind === 'line' ? Math.min(...visual.values) : 0;
  const max = chartMax + (chartMax - chartMin || 1) * 0.1;
  const y = (v: number) => 78 - (61 * (v - chartMin)) / (max - chartMin);
  const pts = (vals: number[]) => vals.map((v, i) => X[i] + ',' + y(v)).join(' ');
  const market = visual.kind === 'market';

  return (
    <div className="tdiag">
      <div className="tdiag__head">
        <strong>{visual.title}</strong>
      </div>
      {chart && (
        <svg className="tdiag__svg" viewBox="0 0 300 88" aria-hidden="true">
          <path d="M22 15V78H278" fill="none" stroke="#b7cec0" />
          {market && <polyline className="tdiag-line tdiag-line--alt" pathLength={1} points={pts([...visual.values].reverse())} />}
          {visual.kind !== 'bars' && <polyline className="tdiag-line" pathLength={1} points={pts(visual.values)} />}
          {visual.values.map((v, i) => {
            const on = i === active;
            return visual.kind === 'bars' ? (
              <rect key={i} className={'tdiag-bar' + (on ? ' is-on' : '')} style={{ ['--i' as string]: i }}
                x={X[i] - 22} y={y(v)} width={44} height={78 - y(v)} rx={4} />
            ) : (
              <circle key={i} className={'tdiag-dot' + (on ? ' is-on' : '')} cx={X[i]} cy={y(v)} r={on ? 6 : 3.5} />
            );
          })}
          {visual.kind !== 'bars' && <circle key={'p' + active} className="tdiag-pulse" cx={X[active]} cy={y(visual.values[active])} r={6} />}
          {market && <circle className="tdiag-dot tdiag-dot--alt is-on" cx={X[active]} cy={y(visual.values[2 - active])} r={5} />}
          <text className="tdiag-value" x={X[active]} y={Math.max(11, y(visual.values[active]) - 9)} textAnchor="middle">{visual.values[active]}</text>
        </svg>
      )}
      {market && <div className="tdiag__legend"><i /> Talab · <i className="alt" /> Taklif</div>}
      <div className="tdiag__steps">
        {visual.steps.map(([label], i) => {
          const Icon = icons?.steps[i];
          return (
            <div className="tdiag__cell" key={label}>
              <button type="button" className={'tdiag__step' + (i === active ? ' is-active' : '') + (Icon ? ' has-icon' : '')}
                onClick={() => pick(i)} aria-pressed={i === active}>
                {Icon && <span className="tdiag__icon" aria-hidden="true"><Icon size={22} strokeWidth={1.7} /></span>}
                <span>{label}</span>
              </button>
              {icons?.sequence && i < 2 && <span className="tdiag__arrow" aria-hidden="true"><ArrowRight size={13} /></span>}
            </div>
          );
        })}
      </div>
      <p className="tdiag__text" key={active} aria-live="off">{visual.steps[active][1]}</p>
    </div>
  );
}
