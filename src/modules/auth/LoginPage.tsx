
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button, Notice } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';
import { AuthShell } from './AuthShell';

export function LoginPage() {
  const { provider } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const login = String(fd.get('login') || '').trim();
    const password = String(fd.get('password') || '');

    if (!login || !password) {
      setError('Login va parolni kiriting.');
      setLoading(false);
      return;
    }

    try {
      const user = await provider.signIn(login, password);

      const room = params.get('xona') ?? '';
      if (/^[A-F0-9]{6}$/.test(room)) {
        navigate(paths.game('jonli') + '?tur=' + (params.get('tur') === 'graph' ? 'graph' : 'quiz') + '&xona=' + room, { replace: true });
      } else if (user.role === 'admin') {
        navigate(paths.admin, { replace: true });
      } else {
        navigate(paths.cabinet, { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Tizimga kirishda xatolik yuz berdi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Tizimga kirish"
      subtitle="Shaxsiy kabinetingizga kirish uchun login va parolingizni kiriting."
      aside={
        <div className="auth__aside-inner">
          <div className="eyebrow eyebrow--light">
            Iqtisodiyot nazariyasi
          </div>

          <h2>Shaxsiy ta’lim kabinetingiz</h2>

          <p>
            Platformada o‘quv materiallari, mavzular,
            testlar va ta’limiy o‘yinlardan foydalaning.
          </p>

          <p>
            Ro‘yxatdan o‘tgan talabalar o‘z login
            va paroli orqali tizimga kiradilar.
          </p>
        </div>
      }
    >
      <form
        className="form mt-5"
        onSubmit={onSubmit}
      >
        <label className="field">
          <span>Login</span>

          <input
            name="login"
            autoComplete="username"
            placeholder="Loginingizni kiriting"
            required
          />
        </label>

        <label className="field">
          <span>Parol</span>

          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Parolingizni kiriting"
            required
          />
        </label>

        {error && (
          <Notice kind="stage" title="Kirishda xatolik">
            {error}
          </Notice>
        )}

        <Button
          type="submit"
          size="lg"
          block
          icon={<LogIn size={18} />}
          disabled={loading}
        >
          {loading ? 'Tekshirilmoqda...' : 'Kirish'}
        </Button>

        <p className="small center muted">
          Akkauntingiz yo‘qmi?{' '}
          <Link to={paths.register} className="link">
            Ro‘yxatdan o‘ting
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
