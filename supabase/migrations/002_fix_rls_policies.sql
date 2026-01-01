-- Fix RLS policies to work without JWT claims
-- This migration updates RLS policies to be more permissive for development
-- and to work with client-side authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON cases;

DROP POLICY IF EXISTS "Users can view COC for their cases" ON chain_of_custody;
DROP POLICY IF EXISTS "Users can insert COC events for their cases" ON chain_of_custody;

DROP POLICY IF EXISTS "Users can view tags for their cases" ON evidence_tags;
DROP POLICY IF EXISTS "Users can insert tags for their cases" ON evidence_tags;
DROP POLICY IF EXISTS "Users can update tags for their cases" ON evidence_tags;
DROP POLICY IF EXISTS "Users can delete tags for their cases" ON evidence_tags;

DROP POLICY IF EXISTS "Users can view search index for their cases" ON file_search_index;
DROP POLICY IF EXISTS "Users can insert search index for their cases" ON file_search_index;
DROP POLICY IF EXISTS "Users can update search index for their cases" ON file_search_index;
DROP POLICY IF EXISTS "Users can delete search index for their cases" ON file_search_index;

DROP POLICY IF EXISTS "Users can view reports for their cases" ON report_exports;
DROP POLICY IF EXISTS "Users can insert reports for their cases" ON report_exports;

-- Create new permissive policies for cases
-- Allow all operations as we're using client-side auth with Clerk
CREATE POLICY "Allow all operations on cases"
  ON cases FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for chain_of_custody
CREATE POLICY "Allow read on chain_of_custody"
  ON chain_of_custody FOR SELECT
  USING (true);

CREATE POLICY "Allow insert on chain_of_custody"
  ON chain_of_custody FOR INSERT
  WITH CHECK (true);

-- Create new permissive policies for evidence_tags
CREATE POLICY "Allow all operations on evidence_tags"
  ON evidence_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for file_search_index
CREATE POLICY "Allow all operations on file_search_index"
  ON file_search_index FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new permissive policies for report_exports
CREATE POLICY "Allow all operations on report_exports"
  ON report_exports FOR ALL
  USING (true)
  WITH CHECK (true);
