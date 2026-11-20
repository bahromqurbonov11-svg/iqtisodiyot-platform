import { useState, type FormEvent, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { paths } from '@/navigation/paths';

/**
 * Guruhli o‘yinlar (Dars rejimi, Biznes yo‘lak) uchun parol qatlami.
 * Parol kiritilganda ko‘rinmaydi (type="password"), "ko‘rsatish" tugmasi yo‘q.
 * Diqqat: bu faqat brauzer tomonidagi to‘siq (o‘qituvchi uchun qulaylik). Parolning o‘zi emas,
 * SHA-256 xeshi saqlanadi. Haqiqiy himoya uchun keyingi bosqichda server tekshiruvi kerak.
 */
const HASH = 'd710202e2a6362e70a830105289eba7b4e89ecff0c6701b4c176c7843bda3e8c';
const KEY = 'econ-group-games-unlocked';

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function unlocked() {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(unlocked);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const field = new FormData(event.currentTarget).get('group-pass');
    setBusy(true);
    try {
      const ok = (await sha256(String(field ?? ''))) === HASH;
      if (ok) {
        try { sessionStorage.setItem(KEY, '1'); } catch { /* xotira yopiq bo‘lsa, faqat shu sahifa uchun ochiladi */ }
        setOpen(true);
      } else setError('Parol noto‘g‘ri.');
    } catch {
      setError('Parolni tekshirib bo‘lmadi. Sahifani HTTPS orqali oching.');
    }
    setBusy(false);
  }

  if (open) return <>{children}</>;
  return (
    <div className="container page">
      <PageHeader title="Guruhli o‘yin" crumbs={[{ label: 'O‘yinlar', to: paths.games }, { label: 'Parol' }]}
        description="Guruhli o‘yinlar o‘qituvchi paroli bilan ochiladi." />
      <Card title="Parolni kiriting">
        <form onSubmit={event => void submit(event)} autoComplete="off" style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
          <label className="field"><span><Lock size={14} aria-hidden /> Parol</span>
            <input className="search-control" type="password" name="group-pass" autoComplete="off" autoFocus required
              aria-invalid={Boolean(error)} onChange={() => setError('')} /></label>
          {error && <p role="alert" className="small" style={{ color: '#c0453a' }}>{error}</p>}
          <Button type="submit" disabled={busy}>Kirish</Button>
        </form>
      </Card>
    </div>
  );
}
