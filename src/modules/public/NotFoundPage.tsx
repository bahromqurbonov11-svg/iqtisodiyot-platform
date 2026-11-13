import { Button } from '@/components/ui';
import { paths } from '@/navigation/paths';

export function NotFoundPage() {
  return (
    <div className="container page empty-page">
      <div className="empty-page__code serif">404</div>
      <h1>Sahifa topilmadi</h1>
      <p className="muted">Manzil noto‘g‘ri yoki sahifa hali yaratilmagan.</p>
      <Button to={paths.home}>Bosh sahifaga qaytish</Button>
    </div>
  );
}
