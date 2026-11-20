import { Card } from '@/components/ui';
import { spent, useLoyalty } from '@/modules/student/loyalty';

/** Sodiqlik nishoni reytingi: semestr yakunida imtiyoz berish uchun o‘qituvchiga. */
export function LoyaltyAdminCard() {
  const data = useLoyalty(true);
  const list = data?.ranking ?? [];
  const holder = list[0] && data && list[0].seconds >= data.min_seconds ? list[0] : undefined;
  return (
    <Card title="Sodiqlik nishoni · Faol vaqt reytingi" className="mt-5">
      <p className="small muted">
        Harakatsiz paytlar hisoblanmaydi. Nishon uchun kamida 10 soat kerak. Semestr yakunida egasiga imtiyoz berishingiz mumkin.
      </p>
      {!data ? <p>Yuklanmoqda…</p> : list.length === 0 ? <p>Hozircha faol vaqt yig‘ilmagan.</p> : (
        <>
          <p><b>{holder ? 'Hozirgi egasi: ' + holder.name : 'Nishon hali hech kimda emas (10 soatga yetgan talaba yo‘q).'}</b></p>
          <ol>
            {list.map((row, index) => (
              <li key={row.name + index}>{row.name} — {spent(row.seconds)}{index > 0 && list[0] ? ' (egasidan ' + spent(list[0].seconds - row.seconds) + ' kam)' : ''}</li>
            ))}
          </ol>
        </>
      )}
    </Card>
  );
}
