import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

export interface LoyaltyData {
  min_seconds: number;
  total: number;
  me: { seconds: number; rank: number } | null;
  top: { name: string; seconds: number; me: boolean }[];
  ranking?: { name: string; seconds: number }[] | null;
}

/** Sodiqlik reytingini serverdan oladi. RPC hali o‘rnatilmagan bo‘lsa, undefined qaytadi. */
export function useLoyalty(enabled: boolean) {
  const [data, setData] = useState<LoyaltyData>();
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void supabase.rpc('econ_loyalty').then(({ data: value, error }) => {
      if (active && !error && value) setData(value as LoyaltyData);
    });
    return () => { active = false; };
  }, [enabled]);
  return data;
}

export function spent(seconds: number) {
  const minutes = Math.max(0, Math.floor(seconds / 60));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? h + ' soat ' + m + ' daqiqa' : m + ' daqiqa';
}
