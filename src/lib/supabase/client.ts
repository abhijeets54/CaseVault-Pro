// CaseVault Pro - Supabase Client Configuration (Client-side with Clerk)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Store the client instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create a Supabase client instance
 * The client will be authenticated with the Clerk token via the provider
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
}

/**
 * Create a Supabase client authenticated with a Clerk token
 * This is called from the provider to set up authentication
 */
export function createAuthenticatedClient(clerkToken: string | null): SupabaseClient {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: clerkToken ? {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    } : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  supabaseInstance = client;
  return client;
}

// Export the default instance (will be set by the provider)
export const supabase = getSupabaseClient();

export default supabase;
