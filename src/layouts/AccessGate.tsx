import { Lock, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Brand } from '@/components/Brand';
import { Button, Notice } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';

/**
 * Himoyalangan bo‘lim darvozasi.
 * Kelajakda: sessiya yo‘q bo‘lsa → /kirish ga yo‘naltiradi.
 * Hozir: haqiqiy kirish yo‘qligini ochiq aytadi va demo ko‘rish rejimini taklif qiladi.
 */
export function AccessGate({ required }: { required: 'student' | 'admin' }) {
  const { previewAs, user } = useAuth();
  const isAdmin = required === 'admin';
  return (
    <div className="gate">
      <div className="gate__card">
        <Brand />
        <div className="gate__icon"><Lock size={26} /></div>
        <h1 className="gate__title">{isAdmin ? 'Administrator paneli' : 'Talaba kabineti'}</h1>
        <p className="muted">
          Bu bo‘lim faqat {isAdmin ? 'fan administratori' : 'tasdiqlangan talabalar'} uchun.
          {user && ` Siz hozir ${user.role === 'admin' ? 'administrator' : 'talaba'} sifatida ko‘ryapsiz.`}
        </p>
        <Notice kind="stage" title="Haqiqiy kirish 3-bosqichda ishga tushadi">
          Hozircha interfeysni namunaviy ma’lumotlar bilan ko‘rib chiqishingiz mumkin. Hech qanday ma’lumot saqlanmaydi.
        </Notice>
        <Button
          size="lg"
          block
          icon={isAdmin ? <ShieldCheck size={18} /> : <GraduationCap size={18} />}
          onClick={() => previewAs(required)}
        >
          {isAdmin ? 'Administrator sifatida ko‘rish (DEMO)' : 'Talaba sifatida ko‘rish (DEMO)'}
        </Button>
        <Button to={paths.home} variant="ghost" icon={<ArrowLeft size={16} />}>Bosh sahifaga qaytish</Button>
      </div>
    </div>
  );
}
