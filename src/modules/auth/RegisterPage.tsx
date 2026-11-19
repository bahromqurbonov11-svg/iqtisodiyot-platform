
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
  const [external, setExternal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadGroups() {
      const { data, error: groupError } = await supabase
        .from('student_groups')
        .select('id, name')
        .eq('is_active', true)
        .order('id');

      if (groupError) {
        setError('Guruhlar ro‘yxatini yuklab bo‘lmadi.');
        return;
      }

      setGroups(data ?? []);
    }

    void loadGroups();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const firstName = String(
      formData.get('first_name') ?? ''
    ).trim();

    const lastName = String(
      formData.get('last_name') ?? ''
    ).trim();

    const username = String(
      formData.get('username') ?? ''
    )
      .trim()
      .toLowerCase();

    const password = String(
      formData.get('password') ?? ''
    );

    const groupId = external ? 900000 : Number(formData.get('group_id'));

    try {
      if (
        !firstName ||
        !lastName ||
        !/^[a-z0-9_]{4,30}$/.test(username) ||
        firstName.length < 2 ||
        lastName.length < 2 ||
        password.length < 10 ||
        password.length > 128 ||
        !groups.some((group) => group.id === groupId)
      ) {
        throw new Error(
          'Barcha maydonlarni to‘g‘ri to‘ldiring.'
        );
      }

      const { data, error: requestError } =
        await supabase.functions.invoke('register-student', {
          body: {
            first_name: firstName,
            last_name: lastName,
            username,
            password,
            group_id: groupId,
          },
        });

      if (requestError || !data?.success) {
        const response = requestError?.context;
        const payload = response instanceof Response
          ? await response.json().catch(() => null)
          : null;
        throw new Error(
          payload?.error ?? data?.error ??
          'Ro‘yxatdan o‘tishda xatolik yuz berdi.'
        );
      }

      setSuccess(true);

      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: `${username}@students.invalid`,
          password,
        });

      if (!loginError) {
        navigate('/kabinet', { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Noma’lum xatolik yuz berdi.'
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
            Ro‘yxatdan o‘tgach, login va parolingiz
            orqali tizimga kirishingiz mumkin.
          </p>
        </div>
      }
    >
      <form className="form mt-5" onSubmit={onSubmit}>
        <div className="form__row">
          <label className="field">
            <span>Familiya</span>
            <input
              name="last_name"
              autoComplete="family-name"
              required
            />
          </label>

          <label className="field">
            <span>Ism</span>
            <input
              name="first_name"
              autoComplete="given-name"
              required
            />
          </label>
        </div>

        <label className="register-external">
          <input type="checkbox" checked={external} onChange={event => setExternal(event.target.checked)} />
          <span>Soliq oliy maktabi talabasi emasman</span>
        </label>
        {external && <p className="small muted">Bu hisobda yopiq o‘quv fayllarini yuklab olish cheklangan.</p>}
        {!external && <label className="field">
          <span>Guruh</span>

          <select
            name="group_id"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Guruhni tanlang
            </option>

            {groups.filter(group => group.id !== 900000).map((group) => (
              <option
                key={group.id}
                value={group.id}
              >
                {group.name}
              </option>
            ))}
          </select>
        </label>}

        <label className="field">
          <span>Login</span>

          <input
            name="username"
            autoComplete="username"
            required
            pattern="[A-Za-z0-9_]{4,30}"
            title="4–30 ta lotin harfi, raqam yoki pastki chiziq"
            placeholder="talaba01"
          />
        </label>

        <label className="field">
          <span>Parol</span>

          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            required
          />
        </label>
        <p className="small muted">Parol kamida 10 ta belgidan iborat bo‘lsin.</p>

        {error && (
          <Notice kind="stage" title="Xatolik">
            {error}
          </Notice>
        )}

        {success && (
          <p className="text-success" role="status">
            Hisobingiz yaratildi.
            Endi tizimga kirishingiz mumkin.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          block
          icon={<UserPlus size={18} />}
          disabled={loading || groups.length === 0}
        >
          {loading
            ? 'Saqlanmoqda...'
            : 'Ro‘yxatdan o‘tish'}
        </Button>

        <p className="small center muted">
          Hisobingiz bormi?{' '}
          <Link
            to={paths.login}
            className="link"
          >
            Tizimga kirish
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
