
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck, UserRound } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';

export function CabinetOverviewPage() {
  const { user } = useAuth();

  const fullName = user?.fullName || 'Talaba';
  const group = user?.group;

  return (
    <>
      <PageHeader
        eyebrow="Talaba kabineti"
        title={`Xush kelibsiz, ${fullName}!`}
        description="Shaxsiy ta’lim kabinetingiz."
        actions={
          <Button
            to={paths.topics}
            icon={<BookOpen size={16} />}
          >
            Mavzular
          </Button>
        }
      />

      <div className="grid grid--2-1 mt-5">
        <Card title="Shaxsiy ma’lumotlar">
          <div className="stack">
            <p>
              <strong>F.I.Sh.:</strong> {fullName}
            </p>

            <p>
              <strong>Guruh:</strong>{' '}
              {group || 'Guruh ma’lumoti yuklanmagan'}
            </p>

            <p>
              <strong>Hisob holati:</strong> Faol
            </p>
          </div>

          <Button
            to={paths.cabinetProfile}
            variant="secondary"
            icon={<UserRound size={16} />}
            className="mt-3"
          >
            Profilim
          </Button>
        </Card>

        <Card title="O‘zlashtirish natijalari">
          <p className="muted">
            Hozircha tasdiqlangan test natijalari
            mavjud emas.
          </p>

          <p className="small mt-3">
            Test natijalarini Supabase bazasiga
            saqlash tizimi keyingi bosqichda ulanadi.
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
            <Link to={paths.cabinetResults} className="link">
              Natijalar sahifasi
            </Link>
          </p>
        </Card>
      </div>
    </>
  );
}
