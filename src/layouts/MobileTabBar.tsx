import { NavLink } from 'react-router-dom';
import { BookOpen, ClipboardCheck, Gamepad2, Home, Library } from 'lucide-react';
import { paths } from '@/navigation/paths';

/**
 * Telefon uchun pastki tezkor menyu: asosiy bo‘limlarga bir bosishda o‘tish.
 * Faqat tor ekranlarda ko‘rinadi (uslub: src/styles/v3.css).
 */
const tabs = [
  { to: paths.home, label: 'Bosh', icon: Home, end: true },
  { to: paths.topics, label: 'Mavzular', icon: BookOpen },
  { to: paths.materials, label: 'Materiallar', icon: Library },
  { to: paths.tests, label: 'Testlar', icon: ClipboardCheck },
  { to: paths.games, label: 'O‘yinlar', icon: Gamepad2 },
];

export function MobileTabBar() {
  return (
    <nav className="tabbar" aria-label="Tezkor menyu">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => 'tabbar__item' + (isActive ? ' is-active' : '')}>
          <span className="tabbar__icon"><Icon size={21} aria-hidden /></span>
          <span className="tabbar__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
