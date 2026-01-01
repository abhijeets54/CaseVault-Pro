/**
 * File metadata types
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  path?: string;
}

/**
 * Image metadata specific fields
 */
export interface ImageMetadata {
  width?: number;
  height?: number;
  make?: string;
  model?: string;
  orientation?: string;
  software?: string;
  dateTime?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: number;
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: string;
}

/**
 * Document metadata specific fields
 */
export interface DocumentMetadata {
  title?: string;
  author?: string;
  creationDate?: string;
  modificationDate?: string;
  application?: string;
  producer?: string;
  pageCount?: number;
  keywords?: string[];
}

/**
 * Audio metadata specific fields
 */
export interface AudioMetadata {
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  codec?: string;
  artist?: string;
  album?: string;
  title?: string;
}

/**
 * Video metadata specific fields
 */
export interface VideoMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  frameRate?: number;
  codec?: string;
  audioCodec?: string;
}

/**
 * Hash values for the file
 */
export interface FileHash {
  md5: string;
  sha256: string;
}

/**
 * Complete file analysis result
 */
export interface FileAnalysis {
  id: string;
  timestamp: number;
  file: FileMetadata;
  hash: FileHash;
  metadata: ImageMetadata | DocumentMetadata | AudioMetadata | VideoMetadata | Record<string, any>;
  mimeType: string;
  fileSignatureMatch: boolean;
}

/**
 * User saved analysis case
 */
export interface AnalysisCase {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  files: FileAnalysis[];
}

/**
 * Report generation options
 */
export interface ReportOptions {
  title: string;
  includeMetadata: boolean;
  includeHashes: boolean;
  includeFileSignature: boolean;
  caseName?: string;
  examinerName?: string;
  notes?: string;
  logo?: string;
}

// Export all new CaseVault Pro types
export * from './database'; 