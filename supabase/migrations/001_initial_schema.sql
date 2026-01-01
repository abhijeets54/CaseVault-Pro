-- CaseVault Pro - Initial Database Schema
-- This migration creates all tables, indexes, and Row Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Cases
-- Purpose: Store investigation cases (container for evidence files)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT UNIQUE NOT NULL,
  case_name TEXT NOT NULL CHECK (char_length(case_name) <= 200),
  case_officer TEXT NOT NULL,
  department TEXT,
  case_status TEXT NOT NULL DEFAULT 'active' CHECK (case_status IN ('active', 'closed', 'archived')),
  description TEXT,
  total_files INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Indexes for cases table
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_status ON cases(case_status, user_id);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);

-- Table 2: Chain of Custody
-- Purpose: Immutable audit trail for all evidence interactions
CREATE TABLE chain_of_custody (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('uploaded', 'analyzed', 'viewed', 'exported', 'tagged', 'modified', 'deleted')),
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_full_name TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  digital_signature TEXT NOT NULL,
  previous_signature TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for chain_of_custody table
CREATE INDEX idx_coc_case_id ON chain_of_custody(case_id);
CREATE INDEX idx_coc_file_hash ON chain_of_custody(file_hash);
CREATE INDEX idx_coc_timestamp ON chain_of_custody(timestamp DESC);
CREATE INDEX idx_coc_activity_type ON chain_of_custody(activity_type);

-- Table 3: Evidence Tags
-- Purpose: User-created tags for evidence categorization
CREATE TABLE evidence_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_hash TEXT NOT NULL,
  tag_name TEXT NOT NULL CHECK (char_length(tag_name) <= 50),
  tag_color TEXT DEFAULT '#7C3AED',
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for evidence_tags table
CREATE INDEX idx_tags_case_id ON evidence_tags(case_id);
CREATE INDEX idx_tags_file_hash ON evidence_tags(case_id, file_hash);
CREATE INDEX idx_tags_tag_name ON evidence_tags(tag_name);

-- Table 4: File Search Index
-- Purpose: Full-text search index for evidence files
CREATE TABLE file_search_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_hash TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_extension TEXT,
  metadata_text TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for file_search_index table
CREATE INDEX idx_search_case_id ON file_search_index(case_id);
CREATE INDEX idx_search_file_hash ON file_search_index(file_hash);
CREATE INDEX idx_search_metadata_gin ON file_search_index USING GIN (to_tsvector('english', metadata_text));
CREATE INDEX idx_search_filename_gin ON file_search_index USING GIN (to_tsvector('english', file_name));
CREATE INDEX idx_search_tags_gin ON file_search_index USING GIN (tags);
CREATE INDEX idx_search_file_type ON file_search_index(file_type);

-- Table 5: Report Exports
-- Purpose: Track generated reports and enable re-download
CREATE TABLE report_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('pdf', 'json', 'csv')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  includes_coc BOOLEAN DEFAULT false,
  file_count INTEGER NOT NULL,
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  download_count INTEGER DEFAULT 0,
  storage_url TEXT
);

-- Indexes for report_exports table
CREATE INDEX idx_reports_case_id ON report_exports(case_id);
CREATE INDEX idx_reports_generated_at ON report_exports(generated_at DESC);

-- Function 1: Auto-update case updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cases table
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for evidence_tags table
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON evidence_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function 2: Update case file counts
CREATE OR REPLACE FUNCTION update_case_file_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cases
    SET total_files = total_files + 1,
        total_size = total_size + NEW.file_size
    WHERE id = NEW.case_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cases
    SET total_files = GREATEST(0, total_files - 1),
        total_size = GREATEST(0, total_size - OLD.file_size)
    WHERE id = OLD.case_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for file_search_index table
CREATE TRIGGER update_case_stats_on_file_insert
  AFTER INSERT ON file_search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_case_file_stats();

CREATE TRIGGER update_case_stats_on_file_delete
  AFTER DELETE ON file_search_index
  FOR EACH ROW
  EXECUTE FUNCTION update_case_file_stats();

-- Function 3: Auto-generate case number
CREATE SEQUENCE case_number_seq;

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  sequence_part TEXT;
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    sequence_part := LPAD(nextval('case_number_seq')::TEXT, 4, '0');
    NEW.case_number := 'CASE-' || date_part || '-' || sequence_part;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating case numbers
CREATE TRIGGER generate_case_number_trigger
  BEFORE INSERT ON cases
  FOR EACH ROW
  EXECUTE FUNCTION generate_case_number();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE chain_of_custody ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;

-- Cases policies
CREATE POLICY "Users can view their own cases"
  ON cases FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert their own cases"
  ON cases FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own cases"
  ON cases FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own cases"
  ON cases FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Chain of custody policies (immutable - INSERT only)
CREATE POLICY "Users can view COC for their cases"
  ON chain_of_custody FOR SELECT
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert COC events for their cases"
  ON chain_of_custody FOR INSERT
  WITH CHECK (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Evidence tags policies
CREATE POLICY "Users can view tags for their cases"
  ON evidence_tags FOR SELECT
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert tags for their cases"
  ON evidence_tags FOR INSERT
  WITH CHECK (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can update tags for their cases"
  ON evidence_tags FOR UPDATE
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can delete tags for their cases"
  ON evidence_tags FOR DELETE
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- File search index policies
CREATE POLICY "Users can view files in their cases"
  ON file_search_index FOR SELECT
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert files in their cases"
  ON file_search_index FOR INSERT
  WITH CHECK (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can update files in their cases"
  ON file_search_index FOR UPDATE
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can delete files in their cases"
  ON file_search_index FOR DELETE
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Report exports policies
CREATE POLICY "Users can view reports for their cases"
  ON report_exports FOR SELECT
  USING (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

CREATE POLICY "Users can insert reports for their cases"
  ON report_exports FOR INSERT
  WITH CHECK (case_id IN (
    SELECT id FROM cases WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

-- Comments for documentation
COMMENT ON TABLE cases IS 'Investigation cases - container for evidence files';
COMMENT ON TABLE chain_of_custody IS 'Immutable audit trail for all evidence interactions';
COMMENT ON TABLE evidence_tags IS 'User-created tags for evidence categorization';
COMMENT ON TABLE file_search_index IS 'Full-text search index for evidence files';
COMMENT ON TABLE report_exports IS 'Track generated reports and enable re-download';
