import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Hourglass, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { Button, Notice } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';
import { demoGroups } from '@/data/demo/learners';
import { AuthShell } from './AuthShell';

const flow = [
  { icon: UserPlus, title: 'Ariza', text: 'Talaba ma’lumotlarini kiritadi.' },
  { icon: Hourglass, title: 'pending — kutilmoqda', text: 'Akkaunt yaratiladi, lekin faol emas.' },
  { icon: CheckCircle2, title: 'approved — tasdiqlangan', text: 'Administrator tasdiqlagach, kirish ochiladi.' },
  { icon: XCircle, title: 'rejected — rad etilgan', text: 'Ma’lumotlar mos kelmasa.' },
  { icon: Ban, title: 'blocked — bloklangan', text: 'Qoidabuzarlik holatida.' },
];

export function RegisterPage() {
  const { provider } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await provider.register({
        fullName: String(fd.get('fullName')),
        group: String(fd.get('group')),
        login: String(fd.get('login')),
        password: String(fd.get('password')),
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthShell
      title="Ro‘yxatdan o‘tish"
      subtitle="Ariza yuboring — fan administratori tasdiqlagach akkauntingiz faollashadi."
      aside={
        <div className="auth__aside-inner">
          <div className="eyebrow eyebrow--light">Akkaunt holatlari</div>
          <h2>Qanday tasdiqlanadi?</h2>
          <ol className="flow">
            {flow.map((f) => (
              <li key={f.title}>
                <span className="flow__icon"><f.icon size={18} /></span>
                <div><strong>{f.title}</strong><p>{f.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      }
    >
      <form className="form mt-5" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Familiya va ism</span>
          <input name="fullName" autoComplete="name" placeholder="Karimov Aziz" required />
        </label>
        <div className="form__row">
          <label className="field">
            <span>Guruh</span>
            <select name="group" defaultValue="">
              <option value="" disabled>Tanlang</option>
              {demoGroups.map((g) => <option key={g}>{g}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Login</span>
            <input name="login" autoComplete="username" placeholder="st11_karimov" required />
          </label>
        </div>
        <label className="field">
          <span>Parol</span>
          <input name="password" type="password" autoComplete="new-password" placeholder="Kamida 8 belgi" required />
        </label>
        {error && <Notice kind="stage" title="Ro‘yxatdan o‘tish hali ishlamaydi">{error} Ma’lumotlaringiz hech qayerga yuborilmadi.</Notice>}
        <Button type="submit" size="lg" block icon={<UserPlus size={18} />}>Ariza yuborish</Button>
        <p className="xs muted center">Guruhlar ro‘yxati — namunaviy. Haqiqiy guruhlar administrator tomonidan kiritiladi.</p>
        <p className="small center muted">
          Akkauntingiz bormi? <Link to={paths.login} className="link">Kirish</Link>
        </p>
      </form>
    </AuthShell>
  );
}
