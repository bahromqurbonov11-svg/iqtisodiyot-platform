import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PageHeader, Badge, StageNotice } from '@/components/ui';
import { games } from '@/data/games';
import { paths } from '@/navigation/paths';
import { GameIcon } from './GameIcon';

export function GamesPage() {
  return (
    <div className="games-page">
      <div className="games-hero">
        <div className="container">
          <PageHeader
            crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘yinlar' }]}
            eyebrow={<><Sparkles size={14} /> Interaktiv o‘yinlar</>}
            title="O‘ynab o‘rganing — o‘ynab tekshiring"
            description="Har bir o‘yin qiziqarli mashq bo‘lishi bilan birga, bilimingiz haqida aniq ma’lumot yig‘adi: qaysi tushunchalar chalkashayotganini ko‘rsatadi."
          />
        </div>
      </div>
      <div className="container page page--flush">
        <StageNotice stage={5}>
          O‘yinlar bittadan qo‘shiladi: birinchisi — “Tushunchalarni moslashtirish” (5-bosqich), qolganlari 8-bosqichda. Hozir har bir
          o‘yinning tavsifi va sahifa tuzilmasi tayyor.
        </StageNotice>
        <div className="games-grid mt-5">
          {games.map((g) => (
            <Link key={g.slug} to={paths.game(g.slug)} className="game-card" style={{ ['--gc' as string]: g.color }}>
              <div className="game-card__art">
                <span className="game-card__num">{g.order}</span>
                <span className="game-card__icon"><GameIcon name={g.icon} size={34} /></span>
                <GameArt type={g.type} />
              </div>
              <div className="game-card__body">
                <h3>{g.title}</h3>
                <p className="small muted">{g.short}</p>
                <div className="game-card__foot">
                  <Badge tone="info">{g.plannedStage}-bosqichda</Badge>
                  <span className="game-card__go">Batafsil <ArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/** O‘yin kartochkasi uchun sodda dekorativ shakllar */
function GameArt({ type }: { type: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, opacity: 0.35 } as const;
  return (
    <svg viewBox="0 0 160 90" className="game-card__svg" aria-hidden>
      {type === 'concept_matching' && (<><rect x="10" y="14" width="44" height="16" rx="6" {...common} /><rect x="10" y="40" width="44" height="16" rx="6" {...common} /><rect x="106" y="14" width="44" height="16" rx="6" {...common} /><rect x="106" y="40" width="44" height="16" rx="6" {...common} /><path d="M54 22 C 80 22, 80 48, 106 48 M54 48 C 80 48, 80 22, 106 22" {...common} /></>)}
      {type === 'logical_sequence' && [0, 1, 2, 3].map((i) => <rect key={i} x={12 + i * 37} y={30 + (i % 2) * 10} width="30" height="22" rx="6" {...common} />)}
      {type === 'compare_contrast' && (<><circle cx="62" cy="45" r="30" {...common} /><circle cx="98" cy="45" r="30" {...common} /></>)}
      {type === 'situational_decision' && (<><path d="M80 80 L80 46 L40 18 M80 46 L120 18 M80 46 L80 14" {...common} /><circle cx="80" cy="46" r="5" {...common} /></>)}
      {type === 'concept_map' && (<><circle cx="80" cy="45" r="9" {...common} /><circle cx="30" cy="20" r="7" {...common} /><circle cx="130" cy="22" r="7" {...common} /><circle cx="36" cy="72" r="7" {...common} /><circle cx="126" cy="70" r="7" {...common} /><path d="M37 23 L72 41 M123 25 L88 41 M43 69 L72 50 M119 67 L88 50" {...common} /></>)}
    </svg>
  );
}
