import { supabase } from './supabase';

export function researchUrl(value: unknown): string | null {
  if (typeof value !== 'string' || /[\s\\]/u.test(value)) return null;
  try {
    const url = new URL(value);
    if (!/^https?:\/\//i.test(value) || url.username || url.password || url.href.length > 2048) return null;
    return url.href;
  } catch {
    return null;
  }
}

export async function loadResearchLink() {
  const { data, error } = await supabase.rpc('econ_get_research_link');
  return { url: researchUrl(data), error };
}
