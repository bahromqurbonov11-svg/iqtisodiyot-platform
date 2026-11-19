import {
  Compass, Factory, Landmark, Coins, Store, Scale, Crown, Tag, Wallet, Briefcase, Calculator, Wheat, BarChart3,
  TrendingUp, PiggyBank, Sprout, Workflow, Activity, Banknote, CreditCard, ShieldCheck, Users, Ship, Handshake,
  DollarSign, type LucideIcon,
} from 'lucide-react';

/** Har bir mavzu uchun rang va ikonka (umumiy tartib raqami bo‘yicha, 1–25). */
const icons: LucideIcon[] = [
  Compass, Factory, Landmark, Coins, Store, Scale, Crown, Tag, Wallet, Briefcase, Calculator, Wheat, BarChart3,
  TrendingUp, PiggyBank, Sprout, Workflow, Activity, Banknote, CreditCard, ShieldCheck, Users, Ship, Handshake, DollarSign,
];
const palette = ['var(--g-teal)', 'var(--g-blue)', 'var(--g-violet)', 'var(--g-coral)', 'var(--g-amber)'];

export function topicStyle(globalOrder: number) {
  const i = Math.max(0, globalOrder - 1);
  return { icon: icons[i % icons.length], color: palette[i % palette.length] };
}
