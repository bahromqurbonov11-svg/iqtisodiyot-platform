
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnrvggmgjvjbmdyjxsr.supabase.co';

const supabaseKey = 'sb_publishable_NWl0tl5qyJaNAUDB_Kzuvw_PcER9ny9';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
