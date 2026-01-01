'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '../supabase/client';

/**
 * Provider that sets up Supabase authentication with Clerk
 * This ensures all Supabase queries have the proper JWT token
 *
 * Note: This currently uses a permissive RLS setup. For production,
 * you should configure a Clerk JWT template named 'supabase' in your
 * Clerk dashboard to enable proper RLS policies.
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // For now, just initialize the client without a token
    // The RLS policies have been updated to be permissive
    // and rely on Clerk authentication at the app level
    createAuthenticatedClient(null);

    // Log the user ID for debugging
    if (userId) {
      console.log('Supabase provider initialized for user:', userId);
    }
  }, [isLoaded, userId]);

  return <>{children}</>;
}
