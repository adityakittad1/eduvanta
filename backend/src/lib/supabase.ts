import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
// @ts-ignore
import WebSocket from 'ws';

// Polyfill WebSocket for Supabase Realtime in Node 18
if (typeof global.WebSocket === 'undefined') {
  (global as any).WebSocket = WebSocket;
}

// We only initialize the client if the URL and Key are provided.
export const supabase = 
  env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY 
    ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
    : null;
