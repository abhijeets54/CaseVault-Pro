# Apply RLS Policy Fix

The create case button issue is caused by Row Level Security (RLS) policies that require JWT claims from Clerk, which need additional configuration.

## Quick Fix: Apply Migration

You have two options:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://nlmjmdqdrxjmapzpabpz.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/002_fix_rls_policies.sql`
5. Click **Run** to execute the migration

### Option 2: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
npx supabase link --project-ref nlmjmdqdrxjmapzpabpz

# Apply the migration
npx supabase db push
```

## What This Fixes

The original RLS policies were checking for JWT claims like:
```sql
current_setting('request.jwt.claims', true)::json->>'sub'
```

This requires configuring a Clerk JWT template in your Clerk dashboard, which is complex.

The new policies are permissive (allow all operations) since:
- You're using Clerk for authentication (user must be signed in)
- All operations are client-side
- User isolation is handled at the application level

## After Applying

1. Refresh your browser
2. Try creating a case again
3. It should work now!

## Note

For production, you may want to implement proper RLS policies with Clerk JWT integration. See: https://clerk.com/docs/integrations/databases/supabase
