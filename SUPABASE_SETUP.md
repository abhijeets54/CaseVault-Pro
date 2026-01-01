# Supabase Setup Instructions for CaseVault Pro

## Prerequisites
- Supabase account (https://supabase.com)
- Supabase project created

## Step 1: Run Database Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

This will create:
- 5 tables: `cases`, `chain_of_custody`, `evidence_tags`, `file_search_index`, `report_exports`
- All necessary indexes for optimal query performance
- Row Level Security (RLS) policies for data isolation
- Triggers for auto-updating timestamps and case statistics
- Function for auto-generating case numbers

## Step 2: Get Environment Variables

1. In your Supabase project, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

3. Create a `.env.local` file in the root of this project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Configure Clerk Integration (for RLS)

Since we're using Clerk for authentication, we need to sync Clerk's JWT with Supabase:

1. In your Clerk dashboard, go to **JWT Templates**
2. Create a new template named "supabase"
3. Add this custom claim:
```json
{
  "sub": "{{user.id}}"
}
```

4. In your Supabase dashboard, go to **Authentication** → **Providers** → **Auth0** (we'll use this for JWT)
5. Enable it and add your Clerk JWKS URL (from Clerk dashboard)

## Step 4: Verify Setup

Run this query in Supabase SQL Editor to verify all tables are created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- cases
- chain_of_custody
- evidence_tags
- file_search_index
- report_exports

## Step 5: Test RLS Policies

Test that Row Level Security is working:

```sql
-- Check that RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should show `rowsecurity = true`.

## Optional: Supabase Storage (Future Enhancement)

If you want to store report files in Supabase Storage:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `reports`
3. Set the bucket to **Private**
4. Add RLS policies for the bucket

## Troubleshooting

**Issue: RLS policies blocking access**
- Make sure your Clerk JWT template is configured correctly
- Verify the `sub` claim matches your user_id in the database
- Check Supabase logs for RLS policy errors

**Issue: Case number generation not working**
- Verify the trigger is created: `SELECT * FROM pg_trigger WHERE tgname = 'generate_case_number_trigger';`
- Check sequence exists: `SELECT * FROM pg_sequences WHERE sequencename = 'case_number_seq';`

**Issue: Full-text search not working**
- Verify GIN indexes are created: `SELECT * FROM pg_indexes WHERE tablename = 'file_search_index';`
- Test with: `SELECT * FROM file_search_index WHERE to_tsvector('english', file_name) @@ to_tsquery('english', 'test');`

## Next Steps

After completing Supabase setup:
1. Install project dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Test the application by creating a case and uploading a file
