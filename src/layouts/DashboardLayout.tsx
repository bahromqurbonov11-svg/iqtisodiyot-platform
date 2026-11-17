
import { useEffect, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  Link,
} from 'react-router-dom';
import { Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { Brand } from '@/components/Brand';
import { adminMenu, studentMenu } from '@/navigation/menus';
import { paths } from '@/navigation/paths';
import { useAuth } from '@/services/auth/AuthContext';
import { AccessGate } from './AccessGate';

export function DashboardLayout({
  role,
}: {
  role: 'student' | 'admin';
}) {
  const { user, provider, exitPreview } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await provider.signOut();
      exitPreview();
      navigate(paths.login, { replace: true });
    } catch (error) {
      console.error('Tizimdan chiqishda xatolik:', error);
      setSigningOut(false);
    }
  };

  if (!user || user.role !== role) {
    return <AccessGate required={role} />;
  }

  const menu = role === 'admin' ? adminMenu : studentMenu;

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <div className={`dash dash--${role}`}>
      <aside
        className={`dash__sidebar${open ? ' is-open' : ''}`}
        aria-label="Bo‘lim menyusi"
      >
        <div className="dash__brand">
          <Brand
            to={role === 'admin' ? paths.admin : paths.cabinet}
          />

          <button
            className="icon-btn dash__close"
            aria-label="Menyuni yopish"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="dash__role">
          {role === 'admin'
            ? 'Administrator paneli'
            : 'Talaba kabineti'}
        </div>

        <nav className="dash__nav">
          {menu.map((group) => (
            <div key={group.title} className="dash__group">
              <div className="dash__group-title">
                {group.title}
              </div>

              {group.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) =>
                    `dash__link${isActive ? ' is-active' : ''}`
                  }
                >
                  {it.icon && (
                    <it.icon size={18} aria-hidden />
                  )}
                  {it.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="dash__sidebar-foot">
          <Link
            to={paths.home}
            className="dash__link"
          >
            <ArrowLeft size={18} aria-hidden />
            Saytga qaytish
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="dash__scrim"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="dash__main">
        <header className="dash__topbar">
          <button
            className="icon-btn dash__burger"
            aria-label="Menyuni ochish"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="dash__user">
            <span className="avatar" aria-hidden>
              {initials}
            </span>

            <span className="dash__user-text">
              <strong>{user.fullName}</strong>
              <small>
                {role === 'admin'
                  ? 'Fan administratori'
                  : `Talaba · ${user.group || 'Guruh belgilanmagan'}`}
              </small>
            </span>

            <button
              className="icon-btn"
              aria-label="Tizimdan chiqish"
              title="Tizimdan chiqish"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main id="main" className="dash__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
