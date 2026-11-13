import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { Brand } from '@/components/Brand';
import { Button } from '@/components/ui';
import { publicMenu } from '@/navigation/menus';
import { paths } from '@/navigation/paths';
import { useI18n } from '@/i18n';
import { useAuth } from '@/services/auth/AuthContext';
import { StageStrip } from './StageStrip';
import { Footer } from './Footer';

export function PublicLayout() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);

  const panelLink = user?.role === 'admin' ? paths.admin : paths.cabinet;

  return (
    <div className="site">
      <a href="#main" className="skip-link">Asosiy mazmunga o‘tish</a>
      <StageStrip />
      <header className="site-header">
        <div className="container site-header__inner">
          <Brand />
          <nav className={`site-nav${open ? ' is-open' : ''}`} aria-label="Asosiy navigatsiya">
            {publicMenu(t).map((m) => (
              <NavLink key={m.to} to={m.to} className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}>
                {m.label}
              </NavLink>
            ))}
            <div className="site-nav__mobile-actions">
              {user ? (
                <Button to={panelLink} icon={<LayoutDashboard size={16} />} block>
                  {user.role === 'admin' ? t.nav.admin : t.nav.cabinet}
                </Button>
              ) : (
                <>
                  <Button to={paths.login} variant="secondary" block>{t.nav.login}</Button>
                  <Button to={paths.register} block>{t.nav.register}</Button>
                </>
              )}
            </div>
          </nav>
          <div className="site-header__actions">
            {user ? (
              <Button to={panelLink} size="sm" icon={<LayoutDashboard size={16} />}>
                {user.role === 'admin' ? t.nav.admin : t.nav.cabinet}
              </Button>
            ) : (
              <>
                <Link to={paths.login} className="site-header__login"><LogIn size={16} /> {t.nav.login}</Link>
                <Button to={paths.register} size="sm">{t.nav.register}</Button>
              </>
            )}
          </div>
          <button className="icon-btn site-header__burger" aria-expanded={open} aria-label={t.nav.menu} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      <main id="main" className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
