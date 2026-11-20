import { LanguageSelect } from '@/components/LanguageSelect';
import { useI18n } from '@/i18n';

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
import { SiteActivityBar } from './VisitReport';

export function DashboardLayout({
  role,
}: {
  role: 'student' | 'admin';
}) {
  const { t } = useI18n();
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

  const labels: Record<string, string> = {
    [paths.home]: t.nav.home, [paths.cabinet]: t.nav.overview, [paths.admin]: t.nav.overview,
    [paths.cabinetResults]: t.nav.results, [paths.cabinetProfile]: t.nav.profile,
    [paths.topics]: t.nav.topics, [paths.tests]: t.nav.tests, [paths.games]: t.nav.games,
    [paths.adminLearners]: t.nav.learners, [paths.adminContent]: t.nav.materials,
    [paths.analytics]: t.nav.analytics, [paths.adminIntegration]: t.nav.integration, [paths.simulator]: t.nav.simulator,
  };
  const sections: Record<string,string> = { Kabinet:t.nav.cabinet, 'O‘qish':t.nav.study, Boshqaruv:t.nav.manage, Tahlil:t.nav.analytics, Sayt:t.nav.site };
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
            to={paths.home}
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
                {sections[group.title] ?? group.title}
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
                  {labels[it.to] ?? it.label}
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
            {t.nav.backToSite}
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
        <SiteActivityBar />
        <header className="dash__topbar">
          <button
            className="icon-btn dash__burger"
            aria-label="Menyuni ochish"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="dash__user">
            <LanguageSelect />
            <span className="avatar" aria-hidden>
              {initials}
            </span>

            <span className="dash__user-text">
              <strong>{user.fullName}</strong>
              <small>
                {role === 'admin'
                  ? 'Fan administratori'
                  : user.external ? 'Tashqi foydalanuvchi' : `Talaba · ${user.group || 'Guruh belgilanmagan'}`}
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
