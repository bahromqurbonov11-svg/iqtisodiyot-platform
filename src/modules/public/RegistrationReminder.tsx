import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';

const key = 'econ-registration-reminder-seen';
let shown = false;
const week = 7 * 24 * 60 * 60 * 1000;

export function RegistrationReminder() {
  const { user, ready } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (user) {
      if (element?.open) element.close();
      return;
    }
    if (!ready || !element || shown) return;
    try { if (Date.now() - Number(localStorage.getItem(key)) < week) return; } catch { /* Use the in-memory marker. */ }
    const timer = window.setTimeout(() => {
      if (document.hidden || element.open || !element.isConnected) return;
      element.showModal();
      shown = true;
      try { localStorage.setItem(key, String(Date.now())); } catch { /* Keep the in-memory marker. */ }
    }, 30_000);
    return () => clearTimeout(timer);
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
