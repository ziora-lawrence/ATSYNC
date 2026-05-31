import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase env vars missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
  );
  
  // Create a graceful proxy that avoids crashing on load and returns mock structures for functions
  supabaseInstance = new Proxy({}, {
    get: (target, prop) => {
      // Return a function that logs the error and returns a mock promise to avoid breaking async flows
      return () => {
        console.error(`[Supabase Mock] Called '${prop}', but Supabase is not configured.`);
        return Promise.resolve({ data: null, error: new Error('Supabase is not configured') });
      };
    }
  });
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseInstance;

