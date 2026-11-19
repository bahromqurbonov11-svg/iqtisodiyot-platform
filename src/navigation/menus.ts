import {
  Home, LayoutDashboard, BarChart3, BookOpen, ClipboardCheck, Gamepad2, User, Users, FolderCog, PlugZap, Library,
  type LucideIcon,
} from 'lucide-react';
import { paths } from './paths';
import type { Dictionary } from '@/i18n/uz';

export interface NavItem {
  to: string;
  label: string;
  icon?: LucideIcon;
  end?: boolean;
}

/** Ochiq sayt (yuqori menyu) */
export const publicMenu = (t: Dictionary): NavItem[] => [
  { to: paths.about, label: t.nav.about },
  { to: paths.topics, label: t.nav.topics },
  { to: paths.materials, label: t.nav.materials },
  { to: paths.tests, label: t.nav.tests },
  { to: paths.games, label: t.nav.games },
];

/** Talaba kabineti (yon menyu) */
export const studentMenu: { title: string; items: NavItem[] }[] = [
  {
    title: 'Kabinet',
    items: [
      { to: paths.home, label: 'Bosh sahifa', icon: Home, end: true },
      { to: paths.cabinet, label: 'Umumiy ko‘rinish', icon: LayoutDashboard, end: true },
      { to: paths.cabinetResults, label: 'Mening natijalarim', icon: BarChart3 },
      { to: paths.cabinetProfile, label: 'Profil', icon: User },
    ],
  },
  {
    title: 'O‘qish',
    items: [
      { to: paths.topics, label: 'Mavzular', icon: BookOpen },
      { to: paths.tests, label: 'Testlar', icon: ClipboardCheck },
      { to: paths.games, label: 'O‘yinlar', icon: Gamepad2 },
    ],
  },
];

/** Administrator paneli (yon menyu) */
export const adminMenu: { title: string; items: NavItem[] }[] = [
  {
    title: 'Boshqaruv',
    items: [
      { to: paths.admin, label: 'Umumiy ko‘rinish', icon: LayoutDashboard, end: true },
      { to: paths.adminLearners, label: 'Talabalar', icon: Users },
      { to: paths.adminContent, label: 'O‘quv materiallari', icon: FolderCog },
    ],
  },
  {
    title: 'Tahlil',
    items: [
      { to: paths.analytics, label: 'Test natijalari', icon: BarChart3 },
      { to: paths.adminIntegration, label: 'Integratsiya', icon: PlugZap },
    ],
  },
  {
    title: 'Sayt',
    items: [
      { to: paths.home, label: 'Bosh sahifa', icon: Home, end: true },
      { to: paths.topics, label: 'Mavzular katalogi', icon: Library },
    ],
  },
];
