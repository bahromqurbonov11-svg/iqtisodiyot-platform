import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';

/**
 * Ro‘yxatdan o‘tmagan mehmonlarga eslatma jadvali.
 * Vaqt faqat sahifa ko‘rinib turganda hisoblanadi (soniyalarda):
 *  1-, 2-, 3-eslatma — har 1 daqiqada;
 *  4-, 5-eslatma — har 3 daqiqada;
 *  6-eslatma (oxirgi) — 10 daqiqadan so‘ng; shundan keyin bu brauzerda qayta chiqmaydi.
 * Jadvalni o‘zgartirish uchun faqat `gaps` massivini tahrirlang.
 */
const gaps = [60, 60, 60, 180, 180, 600];
const doneKey = 'econ-reminder-done';
const stateKey = 'econ-reminder-state';

interface State { elapsed: number; count: number; nextAt: number }

function load(): State {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(stateKey) ?? 'null') as State | null;
    if (parsed && typeof parsed.elapsed === 'number') return parsed;
  } catch { /* xotira yopiq bo‘lsa, boshidan hisoblanadi */ }
  return { elapsed: 0, count: 0, nextAt: gaps[0] };
}

export function RegistrationReminder() {
  const { user, ready } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (user) {
      if (element?.open) element.close();
      return;
    }
    if (!ready || !element) return;
    try { if (localStorage.getItem(doneKey)) return; } catch { /* sessiya hisobi bilan davom etadi */ }
    const state = load();
    const timer = window.setInterval(() => {
      if (document.hidden || element.open || !element.isConnected) return;
      state.elapsed += 1;
      if (state.elapsed >= state.nextAt) {
        element.showModal();
        state.count += 1;
        if (state.count >= gaps.length) {
          window.clearInterval(timer);
          try { localStorage.setItem(doneKey, '1'); } catch { /* e’tiborsiz */ }
        } else {
          state.nextAt = state.elapsed + gaps[state.count];
        }
      }
      try { sessionStorage.setItem(stateKey, JSON.stringify(state)); } catch { /* e’tiborsiz */ }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [ready, user]);

  return <dialog ref={dialog} className="target-dialog" aria-labelledby="registration-reminder-title">
    <div className="stack">
      <h2 id="registration-reminder-title">Platformadan to‘liq foydalaning</h2>
      <p>Ro‘yxatdan o‘tsangiz, test ishlash, natijalaringizni kabinetda ko‘rish va o‘yin reytingida qatnashish imkoniga ega bo‘lasiz.</p>
      <div className="presentation-actions">
        <Link className="btn btn--primary" to={paths.register} onClick={() => dialog.current?.close()}>Ro‘yxatdan o‘tish</Link>
        <button type="button" autoFocus className="btn btn--secondary" onClick={() => dialog.current?.close()}>Keyinroq</button>
      </div>
    </div>
  </dialog>;
}
