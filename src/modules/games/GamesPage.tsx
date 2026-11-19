import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Crosshair, Flag, GitCompareArrows, Lightbulb, SlidersHorizontal, Timer, type LucideIcon } from 'lucide-react';
import { Badge, Button, PageHeader } from '@/components/ui';
import { Reveal } from '@/components/motion/Motion';
import { GameScene } from './GameScene';
import { paths } from '@/navigation/paths';
import { catalogService } from '@/services/catalog.service';

interface GameCard {
  slug: string;
  title: string;
  text: string;
  meta: string;
  cta: string;
  color: string;
  icon: LucideIcon;
  perTopic?: boolean;
}

/** Tezkor o‘yinlar (mavzuga bog‘liq emas) */
const arcade: GameCard[] = [
  { slug: 'mergan', title: 'Mergan', text: 'Harakatlanuvchi nishonni markazda tuting va bonus savollarga javob berib qo‘shimcha o‘q oling.', meta: 'Vaqt o‘qlar soniga bog‘liq', cta: 'O‘ynash', color: 'var(--g-coral)', icon: Crosshair },
  { slug: 'grafikni-boshqar', title: 'Grafikni boshqar', text: 'Talab, taklif va narxni o‘zgartirib, bozor muvozanatini toping.', meta: '8 topshiriq · 5–8 daqiqa', cta: 'O‘ynash', color: 'var(--g-blue)', icon: SlidersHorizontal },
  { slug: 'marraga-yugurish', title: 'Marraga yugurish', text: 'To‘siqlardan sakrab ball yig‘ing. Har 5 ballik marrada savolga javob bering va talabalar reytingiga kiring.', meta: 'Reyting bor', cta: 'O‘yin va reyting', color: 'var(--g-amber)', icon: Flag },
];

/** Mavzu bo‘yicha o‘yinlar */
const byTopic: GameCard[] = [
  { slug: 'moslashtirish', title: 'Tushunchalarni moslashtirish', text: 'Ikki bosqichda atama va ta’riflarni to‘g‘ri juftlang.', meta: '10 ta juftlik', cta: 'O‘yinni ochish', color: 'var(--g-teal)', icon: GitCompareArrows, perTopic: true },
  { slug: 'vaziyatli-qaror', title: 'Vaziyatni tahlil qiling', text: 'Tahlil doskasiga tushuncha va uni asoslaydigan kartani joylashtiring.', meta: '10 ta vaziyat', cta: 'O‘yinni ochish', color: 'var(--g-violet)', icon: Lightbulb, perTopic: true },
];

function GameTile({ g, query, index }: { g: GameCard; query: string; index: number }) {
  const Icon = g.icon;
  return (
    <Reveal delay={index * 70}>
      <Link to={paths.game(g.slug) + (g.perTopic ? query : '')} className="game-tile" style={{ ['--gc' as string]: g.color }}>
        <span className="game-tile__scene"><GameScene slug={g.slug} /></span>
        <span className="game-tile__glow" aria-hidden />
        <span className="game-tile__icon"><Icon size={26} aria-hidden /></span>
        <h3>{g.title}</h3>
        <p>{g.text}</p>
        <span className="game-tile__foot">
          <Badge tone="neutral" icon={<Timer size={12} />}>{g.meta}</Badge>
          <span className="game-tile__cta">{g.cta} <ArrowRight size={15} aria-hidden /></span>
        </span>
      </Link>
    </Reveal>
  );
}

export function GamesPage() {
  const [params, setParams] = useSearchParams();
  const topics = catalogService.getTopics().data;
  const topic = topics.find((item) => item.id === params.get('mavzu')) ?? topics[0];
  const topicQuery = '?mavzu=' + topic.id;

  return (
    <div className="container page">
      <PageHeader crumbs={[{ label: 'Bosh sahifa', to: paths.home }, { label: 'O‘yinlar' }]}
        title="Iqtisodiyot o‘yinlari" description="Marraga yuguring yoki mavzu bo‘yicha mashq qiling." />

      <section className="games-section" aria-labelledby="arcade-h">
        <div className="games-section__head">
          <h2 id="arcade-h">Tezkor o‘yinlar</h2>
          <span className="muted small">Istalgan vaqtda o‘ynang</span>
        </div>
        <div className="game-tiles game-tiles--3">
          {arcade.map((g, i) => <GameTile key={g.slug} g={g} query="" index={i} />)}
        </div>
      </section>

      <section className="games-section" aria-labelledby="topic-games-h">
        <div className="games-section__head">
          <h2 id="topic-games-h">Mavzu bo‘yicha mashq</h2>
          <span className="muted small">Avval mavzuni tanlang</span>
        </div>
        <label className="topic-picker">
          <span className="topic-picker__label">Mavzu</span>
          <select className="search-control" value={topic.id} onChange={(event) => setParams({ mavzu: event.target.value })}>
            {topics.map((item) => <option key={item.id} value={item.id}>{item.globalOrder}. {item.title}</option>)}
          </select>
        </label>
        <div className="game-tiles game-tiles--2">
          {byTopic.map((g, i) => <GameTile key={g.slug + topic.id} g={g} query={topicQuery} index={i} />)}
        </div>
        <div className="mt-4">
          <Button variant="secondary" icon={<BookOpen size={16} />} to={paths.topic(topic.id)}>Mavzu sahifasi</Button>
        </div>
      </section>
    </div>
  );
}
