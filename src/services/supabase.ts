
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gnrvggmgjvjbmdyjxsr.supabase.co';

const supabaseKey = 'PUBLISHABLE_KEY';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
