import { Trophy } from 'lucide-react';
import { Card } from '@/components/ui';

export type RankedPlayer = { name: string; points: number };

export function GameTopThree({ players, signedIn, description }: {
  players?: RankedPlayer[];
  signedIn: boolean;
  description: string;
}) {
  return <Card title="Eng yaxshi 3 talaba">
    <p className="small muted">{description}</p>
    {!signedIn && <p>Reytingni ko‘rish uchun tizimga kiring.</p>}
    {signedIn && players === undefined && <p role="status">Reyting yuklanmoqda…</p>}
    {players?.length === 0 && <p>Hozircha natijalar yo‘q.</p>}
    {!!players?.length && <ol className="game-podium">
      {players.slice(0, 3).map((player, i) => (
        <li key={i}><span className="game-podium__place">{i === 0 && <Trophy size={17} aria-hidden />}{i + 1}</span>
          <strong>{player.name}</strong><span>{player.points} ball</span></li>
      ))}
    </ol>}
  </Card>;
}
