// CaseVault Pro - Database Types
// Auto-generated types matching Supabase schema

// Case Management
export interface Case {
  id: string;
  caseNumber: string; // CASE-YYYYMMDD-XXXX
  caseName: string;
  caseOfficer: string;
  department?: string;
  caseStatus: 'active' | 'closed' | 'archived';
  description?: string;
  totalFiles: number;
  totalSize: number; // bytes
  userId: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

// Database row format (snake_case)
export interface CaseRow {
  id: string;
  case_number: string;
  case_name: string;
  case_officer: string;
  department: string | null;
  case_status: 'active' | 'closed' | 'archived';
  description: string | null;
  total_files: number;
  total_size: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// Chain of Custody
export type ActivityType =
  | 'uploaded'
  | 'analyzed'
  | 'viewed'
  | 'exported'
  | 'tagged'
  | 'modified'
  | 'deleted';

export interface COCEvent {
  id: string;
  caseId: string;
  fileName: string;
  fileHash: string;
  activityType: ActivityType;
  userId: string;
  userEmail: string;
  userFullName: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
  digitalSignature: string;
  previousSignature: string | null;
  timestamp: string;
  createdAt: string;
}

// Database row format
export interface COCEventRow {
  id: string;
  case_id: string;
  file_name: string;
  file_hash: string;
  activity_type: ActivityType;
  user_id: string;
  user_email: string;
  user_full_name: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  digital_signature: string;
  previous_signature: string | null;
  timestamp: string;
  created_at: string;
}

export interface IntegrityResult {
  isValid: boolean;
  errors: string[];
  totalEvents: number;
  verifiedAt: string;
}

export interface COCCertificate {
  fileHash: string;
  fileName: string;
  caseNumber: string;
  chain: COCEvent[];
  integrity: IntegrityResult;
  generatedAt: string;
  generatedBy: string;
}

// Evidence Tags
export interface EvidenceTag {
  id: string;
  caseId: string;
  fileHash: string;
  tagName: string;
  tagColor: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Database row format
export interface EvidenceTagRow {
  id: string;
  case_id: string;
  file_hash: string;
  tag_name: string;
  tag_color: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Search Index
export interface FileSearchRecord {
  id: string;
  caseId: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileExtension?: string;
  metadataText?: string; // Flattened for search
  tags: string[];
  analyzedAt: string;
  indexedAt: string;
}

// Database row format
export interface FileSearchRecordRow {
  id: string;
  case_id: string;
  file_hash: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_extension: string | null;
  metadata_text: string | null;
  tags: string[];
  analyzed_at: string;
  indexed_at: string;
}

// File Analysis
export interface AnalysisResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  hashes: {
    sha256: string;
    md5: string;
  };
  metadata: {
    basic: {
      lastModified: string;
      extension: string;
    };
    exif?: Record<string, any>; // For images
    custom?: Record<string, any>;
  };
  analyzedAt: string;
}

// Reports
export interface ReportData {
  caseInfo: {
    caseNumber: string;
    caseName: string;
    caseOfficer: string;
    department?: string;
    dateOpened: string;
  };
  files: Array<{
    fileName: string;
    fileHash: string;
    fileSize: number;
    fileType: string;
    analysisDate: string;
    metadata: any;
    tags: string[];
    chainOfCustody?: COCEvent[]; // Optional inclusion
  }>;
  summary: {
    totalFiles: number;
    totalSize: number;
    analysisCompletedAt: string;
    generatedBy: string;
  };
  includeCOC: boolean;
}

export interface ReportExport {
  id: string;
  caseId: string;
  reportType: 'pdf' | 'json' | 'csv';
  fileName: string;
  fileSize: number;
  includesCOC: boolean;
  fileCount: number;
  generatedBy: string;
  generatedAt: string;
  downloadCount: number;
  storageUrl?: string;
}

// Database row format
export interface ReportExportRow {
  id: string;
  case_id: string;
  report_type: 'pdf' | 'json' | 'csv';
  file_name: string;
  file_size: number;
  includes_coc: boolean;
  file_count: number;
  generated_by: string;
  generated_at: string;
  download_count: number;
  storage_url: string | null;
}

// Search
export interface SearchFilters {
  fileType?: string;
  minSize?: number;
  maxSize?: number;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface SearchResult extends FileSearchRecord {
  matchRank?: number; // Search relevance score
  highlightedText?: string; // Search term highlighting
}

// Form Inputs
export interface CreateCaseInput {
  caseName: string;
  caseOfficer: string;
  department?: string;
  description?: string;
}

export interface UpdateCaseInput {
  caseName?: string;
  caseOfficer?: string;
  department?: string;
  description?: string;
  caseStatus?: 'active' | 'closed' | 'archived';
}

export interface CreateTagInput {
  caseId: string;
  fileHash: string;
  tagName: string;
  tagColor?: string;
  notes?: string;
}

export interface RecordCOCInput {
  caseId: string;
  fileName: string;
  fileHash: string;
  activityType: ActivityType;
  metadata?: Record<string, any>;
}

export interface GenerateReportInput {
  caseId: string;
  reportType: 'pdf' | 'json' | 'csv';
  includeCOC: boolean;
  fileHashes?: string[]; // Optional: specific files only
}

// Helper type converters
export function toCamelCase(row: CaseRow): Case {
  return {
    id: row.id,
    caseNumber: row.case_number,
    caseName: row.case_name,
    caseOfficer: row.case_officer,
    department: row.department ?? undefined,
    caseStatus: row.case_status,
    description: row.description ?? undefined,
    totalFiles: row.total_files,
    totalSize: row.total_size,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at ?? undefined,
  };
}

export function cocEventToCamelCase(row: COCEventRow): COCEvent {
  return {
    id: row.id,
    caseId: row.case_id,
    fileName: row.file_name,
    fileHash: row.file_hash,
    activityType: row.activity_type,
    userId: row.user_id,
    userEmail: row.user_email,
    userFullName: row.user_full_name,
    ipAddress: row.ip_address ?? undefined,
    userAgent: row.user_agent ?? undefined,
    metadata: row.metadata,
    digitalSignature: row.digital_signature,
    previousSignature: row.previous_signature,
    timestamp: row.timestamp,
    createdAt: row.created_at,
  };
}

export function evidenceTagToCamelCase(row: EvidenceTagRow): EvidenceTag {
  return {
    id: row.id,
    caseId: row.case_id,
    fileHash: row.file_hash,
    tagName: row.tag_name,
    tagColor: row.tag_color,
    notes: row.notes ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fileSearchRecordToCamelCase(
  row: FileSearchRecordRow
): FileSearchRecord {
  return {
    id: row.id,
    caseId: row.case_id,
    fileHash: row.file_hash,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSize: row.file_size,
    fileExtension: row.file_extension ?? undefined,
    metadataText: row.metadata_text ?? undefined,
    tags: row.tags,
    analyzedAt: row.analyzed_at,
    indexedAt: row.indexed_at,
  };
}

export function reportExportToCamelCase(row: ReportExportRow): ReportExport {
  return {
    id: row.id,
    caseId: row.case_id,
    reportType: row.report_type,
    fileName: row.file_name,
    fileSize: row.file_size,
    includesCOC: row.includes_coc,
    fileCount: row.file_count,
    generatedBy: row.generated_by,
    generatedAt: row.generated_at,
    downloadCount: row.download_count,
    storageUrl: row.storage_url ?? undefined,
  };
}
