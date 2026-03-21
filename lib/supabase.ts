import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Type for Supabase client
export type SupabaseClientType = SupabaseClient;

// Browser client (for client-side usage)
export const supabase: SupabaseClientType = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (for server-side operations with elevated privileges)
export const supabaseAdmin: SupabaseClientType = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Default export
export default supabase;
