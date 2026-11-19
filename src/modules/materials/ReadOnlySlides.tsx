import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import previews from '@/data/slide-previews.json';

const slidesByTopic: Record<string, string[][]> = previews;
export function ReadOnlySlides({ number }: { number: number }) {
  const [index, setIndex] = useState(0);
  const slides = slidesByTopic[number] ?? [];
  if (!slides.length) return <Card title="Taqdimot"><p>Ko‘rish uchun slayd mavjud emas.</p></Card>;
  return <Card title="Taqdimotni ko‘rish">
    <details>
      <summary>Slaydlarni ochish</summary>
      <div className="stack mt-3">
        <div className="case-step" aria-live="polite">
          <strong>Slayd {index + 1} / {slides.length}</strong>
          {slides[index].length ? slides[index].map((line, i) => <p key={i}>{line}</p>) : <p>Ushbu slayd faqat tasvir yoki chizmadan iborat.</p>}
        </div>
        <div className="presentation-actions">
          <Button variant="secondary" disabled={index === 0} onClick={() => setIndex(i => i - 1)}>Oldingi</Button>
          <Button variant="secondary" disabled={index >= slides.length - 1} onClick={() => setIndex(i => i + 1)}>Keyingi</Button>
        </div>
      </div>
    </details>
  </Card>;
}
