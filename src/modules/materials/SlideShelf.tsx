import { Link } from 'react-router-dom';
import { ArrowRight, Presentation } from 'lucide-react';
import { Reveal } from '@/components/motion/Motion';
import previews from '@/data/slide-previews.json';
import { catalogService } from '@/services/catalog.service';
import { topicStyle } from '@/modules/catalog/topicStyle';
import { paths } from '@/navigation/paths';

const slidesByTopic: Record<string, string[][]> = previews;

/** Taqdimotlar javoni: har mavzu uchun birinchi slayd ko‘rinishidagi rangli karta (ro‘yxatdan o‘tmasdan ham ochiq). */
export function SlideShelf() {
  const topics = catalogService.getTopics().data.filter((t) => slidesByTopic[t.globalOrder]?.length);
  return (
    <div className="shelf">
      {topics.map((t, i) => {
        const deck = slidesByTopic[t.globalOrder];
        const style = topicStyle(t.globalOrder);
        return (
          <Reveal key={t.id} delay={(i % 4) * 60}>
            <Link to={paths.topic(t.id) + '?tab=taqdimot'} className="shelf__card" style={{ ['--gc' as string]: style.color }}>
              <span className="shelf__slide">
                <span className="shelf__num">{t.globalOrder}</span>
                <span className="shelf__first">{deck[0]?.[0] ?? t.title}</span>
                <Presentation className="shelf__ico" size={46} aria-hidden />
              </span>
              <strong>{t.title}</strong>
              <span className="shelf__meta">{deck.length} ta slayd <ArrowRight size={15} aria-hidden /></span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
