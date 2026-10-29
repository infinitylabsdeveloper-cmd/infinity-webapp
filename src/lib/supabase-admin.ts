import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const getCleanEnv = (val?: string) => {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.toUpperCase().includes('YOUR_')) return '';
  return trimmed;
};

const supabaseUrl =
  getCleanEnv(process.env.SUPABASE_URL) ||
  getCleanEnv(process.env.VITE_SUPABASE_URL) ||
  'https://demo-appsc-portal.supabase.co';

const serviceRoleKey =
  getCleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
  getCleanEnv(process.env.SUPABASE_ANON_KEY) ||
  getCleanEnv(process.env.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIn0.demoKey';

export const isSupabaseAdminConfigured = Boolean(
  getCleanEnv(process.env.SUPABASE_URL) || getCleanEnv(process.env.VITE_SUPABASE_URL)
);

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default supabaseAdmin;
