import { Link2, ListOrdered, GitCompare, Compass, Network } from 'lucide-react';
import type { GameDefinition } from '@/data/games';

const map = { Link2, ListOrdered, GitCompare, Compass, Network };

export function GameIcon({ name, size = 20 }: { name: GameDefinition['icon']; size?: number }) {
  const I = map[name];
  return <I size={size} aria-hidden />;
}
