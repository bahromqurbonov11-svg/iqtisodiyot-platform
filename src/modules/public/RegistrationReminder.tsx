import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/services/auth/AuthContext';
import { paths } from '@/navigation/paths';

const key = 'econ-registration-reminder-seen';
let shown = false;

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
    try { if (localStorage.getItem(key)) return; } catch { /* Use the in-memory marker. */ }
    element.showModal();
    shown = true;
    try { localStorage.setItem(key, '1'); } catch { /* The marker lasts for this page load. */ }
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
