import type { ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LineChart, Lock, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { MarketSimulator } from '@/modules/simulators/MarketSimulator';

/**
 * Simulyatorlar ro‘yxati. Yangi simulyator qo‘shish uchun:
 * 1) src/modules/simulators/ ichida komponent yarating;
 * 2) uni quyidagi `simulators` massiviga qo‘shing.
 */
interface SimulatorItem { id: string; title: string; description: string; icon: LucideIcon; Component: () => ReactElement }

const simulators: SimulatorItem[] = [
  { id: 'bozor', title: 'Bozor muvozanati', description: 'Talab, taklif, soliq, subsidiya va narx cheklovlari ta’sirini aniq raqamlarda ko‘ring.', icon: LineChart, Component: MarketSimulator },
];
const planned = ['Talab va taklif elastikligi', 'Ishlab chiqarish xarajatlari', 'Monopoliya va raqobat'];

export function SimulatorPage() {
  const [params, setParams] = useSearchParams();
  const active = simulators.find(item => item.id === params.get('sim')) ?? simulators[0];
  const Active = active.Component;
  return (
    <div className="container page">
      <PageHeader eyebrow="Simulyatorlar" title={active.title} description={active.description} />
      <div className="sim-tabs" role="tablist" aria-label="Simulyatorlar">
        {simulators.map(item => (
          <button key={item.id} type="button" role="tab" aria-selected={item.id === active.id} className={'sim-tab' + (item.id === active.id ? ' is-on' : '')}
            onClick={() => setParams({ sim: item.id })}><item.icon size={17} aria-hidden /> {item.title}</button>
        ))}
        {planned.map(title => <span key={title} className="sim-tab is-soon" aria-disabled="true"><Lock size={14} aria-hidden /> {title} <em>rejada</em></span>)}
      </div>
      <Active />
    </div>
  );
}
