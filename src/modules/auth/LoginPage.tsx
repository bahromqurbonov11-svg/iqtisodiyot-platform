import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldCheck, LogIn } from 'lucide-react';
import { Button, Notice } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';
import { AuthShell } from './AuthShell';

export function LoginPage() {
  const { provider, previewAs } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await provider.signIn(String(fd.get('login')), String(fd.get('password')));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <AuthShell
      title="Kirish"
      subtitle="Login va parolingiz bilan tizimga kiring."
      aside={
        <div className="auth__aside-inner">
          <div className="eyebrow eyebrow--light">Demo ko‘rish rejimi</div>
          <h2>Interfeysni hozir ko‘rib chiqing</h2>
          <p>Haqiqiy kirish hali yo‘q. Kabinet va panellarni namunaviy ma’lumotlar bilan ko‘rishingiz mumkin. Hech narsa saqlanmaydi.</p>
          <div className="stack stack--sm mt-4">
            <Button variant="light" icon={<GraduationCap size={18} />} onClick={() => { previewAs('student'); navigate(paths.cabinet); }}>
              Talaba kabinetini ko‘rish
            </Button>
            <Button variant="light" icon={<ShieldCheck size={18} />} onClick={() => { previewAs('admin'); navigate(paths.admin); }}>
              Administrator panelini ko‘rish
            </Button>
          </div>
        </div>
      }
    >
      <form className="form mt-5" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Login</span>
          <input name="login" autoComplete="username" placeholder="masalan: st11_karimov" required />
        </label>
        <label className="field">
          <span>Parol</span>
          <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
        </label>
        {error && <Notice kind="stage" title="Kirish hali ishlamaydi">{error}</Notice>}
        <Button type="submit" size="lg" block icon={<LogIn size={18} />}>Kirish</Button>
        <p className="small center muted">
          Akkauntingiz yo‘qmi? <Link to={paths.register} className="link">Ro‘yxatdan o‘ting</Link>
        </p>
      </form>
    </AuthShell>
  );
}
