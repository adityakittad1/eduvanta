import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// We only initialize the client if the URL and Key are provided.
export const supabase = 
  env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY 
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    : null;
