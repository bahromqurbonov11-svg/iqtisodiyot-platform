import { PageHeader, Card, StatusBadge, StageNotice, Button } from '@/components/ui';
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
            <div><dt>Interfeys tili</dt><dd>O‘zbekcha (rus tili keyinroq)</dd></div>
          </dl>
        </Card>
        <Card title="Xavfsizlik">
          <StageNotice stage={3}>Parolni o‘zgartirish va sessiyalarni boshqarish haqiqiy kirish tizimi bilan birga qo‘shiladi.</StageNotice>
          <Button disabled className="mt-4">Parolni o‘zgartirish</Button>
        </Card>
      </div>
    </>
  );
}
