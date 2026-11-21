import { supabase } from '@/services/supabase';

export async function loadTopicContent(number: number) {
  const [{ data, error }, { default: JSZip }] = await Promise.all([
    supabase.storage.from('topic-content').download(number + '.zip'),
    import('jszip'),
  ]);
  if (error || !data) throw new Error('Topic content unavailable');
  return JSZip.loadAsync(await data.arrayBuffer());
}
