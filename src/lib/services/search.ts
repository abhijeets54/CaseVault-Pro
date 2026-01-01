import { supabase } from '../supabase/client';
import {
  FileSearchRecord,
  FileSearchRecordRow,
  SearchFilters,
  SearchResult,
  fileSearchRecordToCamelCase,
} from '../types';

export class SearchService {
  static async indexFile(
    caseId: string,
    fileHash: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    metadata: any,
    tags: string[] = []
  ): Promise<boolean> {
    try {
      const fileExtension = fileName.split('.').pop() || '';
      const metadataText = this.flattenMetadata(metadata);

      const { error } = await supabase.from('file_search_index').upsert({
        case_id: caseId,
        file_hash: fileHash,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_extension: fileExtension,
        metadata_text: metadataText,
        tags,
        analyzed_at: new Date().toISOString(),
        indexed_at: new Date().toISOString(),
      });

      return !error;
    } catch (error) {
      console.error('Error indexing file:', error);
      return false;
    }
  }

  static async search(
    caseId: string,
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    let supabaseQuery = supabase
      .from('file_search_index')
      .select('*')
      .eq('case_id', caseId);

    if (query && query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `file_name.ilike.%${query}%,metadata_text.ilike.%${query}%`
      );
    }

    if (filters?.fileType) {
      supabaseQuery = supabaseQuery.eq('file_type', filters.fileType);
    }

    if (filters?.minSize !== undefined) {
      supabaseQuery = supabaseQuery.gte('file_size', filters.minSize);
    }

    if (filters?.maxSize !== undefined) {
      supabaseQuery = supabaseQuery.lte('file_size', filters.maxSize);
    }

    if (filters?.dateFrom) {
      supabaseQuery = supabaseQuery.gte('analyzed_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      supabaseQuery = supabaseQuery.lte('analyzed_at', filters.dateTo);
    }

    if (filters?.tags && filters.tags.length > 0) {
      supabaseQuery = supabaseQuery.contains('tags', filters.tags);
    }

    const { data, error } = await supabaseQuery;

    if (error || !data) {
      console.error('Search error:', error);
      return [];
    }

    return data.map((row) => fileSearchRecordToCamelCase(row as FileSearchRecordRow));
  }

  static async updateTags(fileHash: string, tags: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('file_search_index')
        .update({ tags })
        .eq('file_hash', fileHash);

      return !error;
    } catch (error) {
      console.error('Error updating tags:', error);
      return false;
    }
  }

  static async deleteFile(fileHash: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('file_search_index')
        .delete()
        .eq('file_hash', fileHash);

      return !error;
    } catch (error) {
      console.error('Error deleting file from index:', error);
      return false;
    }
  }

  private static flattenMetadata(metadata: any): string {
    if (!metadata) return '';

    const flatten = (obj: any, prefix = ''): string[] => {
      const result: string[] = [];

      for (const key in obj) {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result.push(...flatten(value, fullKey));
        } else {
          result.push(`${fullKey}: ${value}`);
        }
      }

      return result;
    };

    return flatten(metadata).join(' | ');
  }
}
