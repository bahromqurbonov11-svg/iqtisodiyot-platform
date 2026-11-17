
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button, Notice } from '@/components/ui';
import { paths } from '@/navigation/paths';
import { supabase } from '@/services/supabase';
import { AuthShell } from './AuthShell';

type StudentGroup = {
  id: number;
  name: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      const { data, error } = await supabase
        .from('student_groups')
        .select('id, name')
        .eq('is_active', true)
        .order('id');

      if (error) {
        setError('Guruhlar ro‘yxatini yuklab bo‘lmadi.');
        return;
      }

      setGroups(data ?? []);
    }

    void loadGroups();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const username = String(fd.get('username') ?? '')
      .trim()
      .toLowerCase();
    const password = String(fd.get('password') ?? '');

    try {
      const { data, error: requestError } =
        await supabase.functions.invoke('register-student', {
          body: {
            first_name: String(fd.get('first_name') ?? '').trim(),
            last_name: String(fd.get('last_name') ?? '').trim(),
            username,
            password,
            group_id: Number(fd.get('group_id')),
          },
        });

      if (requestError || !data?.success) {
        throw new Error(
          data?.error ?? 'Ro‘yxatdan o‘tishda xatolik yuz berdi.'
        );
      }

      setSuccess(true);

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: `${username}@students.invalid`,
          password,
        });

      if (!loginError) {
        navigate('/kabinet');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Noma’lum xatolik.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Ro‘yxatdan o‘tish"
      subtitle="Ma’lumotlaringizni kiriting va talaba hisobini yarating."
      aside={
        <div className="auth__aside-inner">
          <div className="eyebrow eyebrow--light">
            Talabalar uchun
          </div>
          <h2>Shaxsiy hisobingizni yarating</h2>
          <p>
            Ro‘yxatdan o‘tgach, login va parolingiz orqali
            tizimga kirishingiz mumkin.
          </p>
        </div>
      }
    >
      <form className="form mt-5" onSubmit={onSubmit}>
        <div className="form__row">
          <label className="field">
            <span>Familiya</span>
            <input name="last_name" required />
          </label>
          <label className="field">
            <span>Ism</span>
            <input name="first_name" required />
          </label>
        </div>

        <label className="field">
          <span>Guruh</span>
          <select name="group_id" defaultValue="" required>
            <option value="" disabled>
              Guruhni tanlang
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Login</span>
          <input
            name="username"
            autoComplete="username"
            required
            placeholder="talaba01"
          />
        </label>

        <label className="field">
          <span>Parol</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        {error && (
          <Notice kind="stage" title="Xatolik">
            {error}
          </Notice>
        )}

        {success && (
          <p>
            Hisobingiz yaratildi. Endi tizimga kirishingiz mumkin.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          block
          icon={<UserPlus size={18} />}
          disabled={loading || groups.length === 0}
        >
          {loading ? 'Saqlanmoqda...' : 'Ro‘yxatdan o‘tish'}
        </Button>

        <p className="small center muted">
          Hisobingiz bormi?{' '}
          <Link to={paths.login} className="link">
            Tizimga kirish
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
