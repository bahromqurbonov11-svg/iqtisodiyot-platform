import { useParams, Link } from 'react-router-dom';
import { Play, Database, Microscope, ListOrdered } from 'lucide-react';
import { PageHeader, Card, Badge, Button, StageNotice } from '@/components/ui';
import { games } from '@/data/games';
import { paths } from '@/navigation/paths';
import { NotFoundPage } from '@/modules/public/NotFoundPage';
import { GameIcon } from './GameIcon';

/**
 * O‘yin sahifasi shabloni. O‘yin dvigateli shu sahifaning "O‘yin maydoni"
 * blokiga alohida komponent sifatida ulanadi (modules/games/engines/...).
 */
export function GameDetailPage() {
  const { slug = '' } = useParams();
  const game = games.find((g) => g.slug === slug);
  if (!game) return <NotFoundPage />;
  const idx = games.indexOf(game);

  return (
    <div className="games-page" style={{ ['--gc' as string]: game.color }}>
      <div className="games-hero games-hero--detail">
        <div className="container">
          <PageHeader
            crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: game.title }]}
            eyebrow={<>{game.order}-o‘yin</>}
            title={game.title}
            description={game.description}
            badges={<Badge tone="info">{game.plannedStage}-bosqichda ishga tushadi</Badge>}
          />
        </div>
      </div>
      <div className="container page page--flush">
        <div className="game-layout">
          <Card className="arena" padded={false}>
            <div className="arena__stage">
              <span className="arena__icon"><GameIcon name={game.icon} size={44} /></span>
              <h3>O‘yin maydoni</h3>
              <p className="small muted">O‘yin hali yaratilmagan. Bu joyga o‘yin dvigateli ulanadi.</p>
              <Button disabled icon={<Play size={16} />} title={`${game.plannedStage}-bosqichda`}>O‘yinni boshlash</Button>
            </div>
          </Card>
          <div className="stack">
            <Card title="Qanday o‘ynaladi" actions={<ListOrdered size={18} className="muted" />}>
              <ol className="plan plan--sm">
                {game.howItWorks.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}
              </ol>
            </Card>
            <Card title="Diagnostik qiymati" actions={<Microscope size={18} className="muted" />}>
              <ul className="dots">{game.diagnosticValue.map((s) => <li key={s}>{s}</li>)}</ul>
            </Card>
            <Card title="Yig‘iladigan ma’lumotlar" actions={<Database size={18} className="muted" />}>
              <ul className="dots">{game.collectedData.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="xs muted mt-3">Har bir harakat urinish (attempt_id) tarkibida saqlanadi va analitikaga uzatiladi.</p>
            </Card>
          </div>
        </div>
        <StageNotice stage={game.plannedStage} />
        <div className="pager mt-5">
          {idx > 0 ? <Link className="pager__link" to={paths.game(games[idx - 1].slug)}><span><small>Oldingi o‘yin</small>{games[idx - 1].title}</span></Link> : <span />}
          {idx < games.length - 1 && <Link className="pager__link pager__link--next" to={paths.game(games[idx + 1].slug)}><span><small>Keyingi o‘yin</small>{games[idx + 1].title}</span></Link>}
        </div>
      </div>
    </div>
  );
}
