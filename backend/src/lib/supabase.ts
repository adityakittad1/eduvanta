import WebSocket from 'ws';

// Polyfill WebSocket for Supabase Realtime in environments where it is missing (Node 18/20)
try {
  if (typeof (globalThis as any).WebSocket === 'undefined') {
    (globalThis as any).WebSocket = WebSocket;
  }
} catch {
  // Ignore in strict or read-only runtimes
}

import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// Safely initialize client only when valid URL and Key are provided
export const supabase = (() => {
  try {
    return env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY 
      ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
      : null;
  } catch {
    return null;
  }
})();


