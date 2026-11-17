
import { Link } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { paths } from '@/navigation/paths';

export function CabinetResultsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Talaba kabineti"
        title="Mening natijalarim"
        description="Test natijalaringiz va mavzular bo‘yicha o‘zlashtirish ko‘rsatkichlari."
      />

      <Card title="Test natijalari" className="mt-5">
        <p className="muted">
          Hozircha bu sahifaga haqiqiy test natijalari
          ulanmagan.
        </p>

        <p className="small mt-3">
          Test natijalarini Supabase bazasiga saqlash
          tizimi ishga tushirilgach, bu yerda
          har bir test bo‘yicha ball, foiz,
          urinishlar soni va topshirilgan sana
          ko‘rsatiladi.
        </p>

        <Button
          to={paths.tests}
          variant="secondary"
          icon={<ClipboardCheck size={16} />}
          className="mt-3"
        >
          Testlarga o‘tish
        </Button>

        <p className="small mt-3">
          <Link to={paths.cabinet} className="link">
            Shaxsiy kabinetga qaytish
          </Link>
        </p>
      </Card>
    </>
  );
}
