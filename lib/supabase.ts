import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlzwmldvrxdlvosottrt.supabase.co';
const supabaseKey = 'sb_publishable_Xnb9fZ85X_em1AggmXf8qA_rJxG8asd';

export const supabase = createClient(supabaseUrl, supabaseKey);
