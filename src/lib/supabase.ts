import { createClient } from '@supabase/supabase-js';

const getCleanEnv = (val?: string) => {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.toUpperCase().includes('YOUR_') || trimmed === 'https://xyzcompany.supabase.co') return '';
  return trimmed;
};

export const supabaseUrl =
  getCleanEnv(import.meta.env.VITE_SUPABASE_URL) ||
  getCleanEnv(import.meta.env.SUPABASE_URL) ||
  'https://demo-appsc-portal.supabase.co';

export const supabaseAnonKey =
  getCleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  getCleanEnv(import.meta.env.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIn0.demoKey';

export const isSupabaseConfigured = Boolean(
  getCleanEnv(import.meta.env.VITE_SUPABASE_URL) || getCleanEnv(import.meta.env.SUPABASE_URL)
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
