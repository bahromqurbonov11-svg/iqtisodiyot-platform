import { BookMarked, BookOpen, LibraryBig } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';

const library = 'https://oliymaktab.uz/uz/students/library/books';
const resources = [
  { title: 'Darslik', book: 31, Icon: BookMarked, color: 'var(--g-teal)' },
  { title: 'O‘quv qo‘llanma', book: 32, Icon: BookOpen, color: 'var(--g-blue)' },
  { title: 'Ma’ruza matnlari to‘plami', book: 3, Icon: LibraryBig, color: 'var(--g-violet)' },
];

export function LiteraturePage() {
  return (
    <div className="container page">
      <PageHeader title="Adabiyotlar" crumbs={[{ label: 'Materiallar', to: paths.materials }, { label: 'Adabiyotlar' }]}
        description="Soliq oliy maktabi kutubxonasidagi o‘quv adabiyotlari." />
      <div className="cat-grid mt-5">
        {resources.map(({ title, book, Icon, color }) => (
          <a key={title} href={library + '/' + book} className="card card--pad cat-card"
            style={{ color: 'inherit', ['--gc' as string]: color }}>
            <span className="cat-card__icon"><Icon size={22} aria-hidden /></span>
            <strong>{title}</strong>
            <span className="cat-card__foot">Kutubxonada ochish</span>
          </a>
        ))}
      </div>
    </div>
  );
}
