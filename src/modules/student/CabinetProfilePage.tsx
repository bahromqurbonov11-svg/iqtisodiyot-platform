import { PageHeader, Card, StatusBadge } from '@/components/ui';
import { LanguageSelect } from '@/components/LanguageSelect';
import { useAuth } from '@/services/auth/AuthContext';

export function CabinetProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageHeader eyebrow="Talaba kabineti" title="Profil" description="Shaxsiy ma’lumotlar va akkaunt holati." />
      <div className="grid grid--2 mt-5">
        <Card title="Shaxsiy ma’lumotlar">
          <dl className="kv">
            <div><dt>F.I.Sh.</dt><dd>{user.fullName}</dd></div>
            <div><dt>Guruh</dt><dd>{user.group}</dd></div>
            <div><dt>Rol</dt><dd>Talaba</dd></div>
            <div><dt>Akkaunt holati</dt><dd><StatusBadge status={user.status} /></dd></div>
            <div><dt>Interfeys menyulari tili</dt><dd><LanguageSelect /></dd></div>
          </dl>
        </Card>
      </div>
    </>
  );
}
