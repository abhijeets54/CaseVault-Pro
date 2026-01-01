// Server-side Supabase client with Clerk authentication
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * Creates a Supabase client authenticated with the current Clerk user's token
 * This is for server-side operations (Server Components, Server Actions, Route Handlers)
 */
export async function createServerSupabaseClient() {
  const { getToken, userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get the Supabase token from Clerk
  // This will be the JWT that contains the user's claims
  const token = await getToken({ template: 'supabase' });

  // Create Supabase client with the auth token
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });

  return { supabase, userId };
}
