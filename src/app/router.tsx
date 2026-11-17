
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/services/supabase';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Parol kamida 8 ta belgidan iborat bo‘lsin.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Parollar bir xil emas.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !data.session) {
        throw new Error(
          'Parolni tiklash sessiyasi topilmadi. Yangi tiklash havolasini so‘rang.'
        );
      }

      const { error: updateError } =
        await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setMessage('Parol muvaffaqiyatli yangilandi.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Parolni yangilab bo‘lmadi.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 440,
      margin: '70px auto',
      padding: 24
    }}>
      <h1>Yangi parol o‘rnatish</h1>

      <p className="muted mt-3">
        Hisobingiz uchun yangi parol belgilang.
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <label htmlFor="new-password">
          Yangi parol
        </label>
        <input
          id="new-password"
          className="input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="mt-3">
          <label htmlFor="confirm-password">
            Parolni takrorlang
          </label>
          <input
            id="confirm-password"
            className="input"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            required
          />
        </div>

        {error && (
          <p className="text-danger mt-3" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="text-success mt-3" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="btn btn--primary btn--md mt-4"
          disabled={loading}
        >
          {loading ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'}
        </button>
      </form>

      <p className="mt-4">
        <Link to="/kirish" className="link">
          Kirish sahifasiga qaytish
        </Link>
      </p>
    </div>
  );
}
