import { supabase } from '../supabase/client';
import {
  EvidenceTag,
  EvidenceTagRow,
  CreateTagInput,
  evidenceTagToCamelCase,
} from '../types';

export class TaggingService {
  static async createTag(
    input: CreateTagInput & { createdBy: string }
  ): Promise<EvidenceTag | null> {
    try {
      const { data, error } = await supabase
        .from('evidence_tags')
        .insert({
          case_id: input.caseId,
          file_hash: input.fileHash,
          tag_name: input.tagName,
          tag_color: input.tagColor || '#7C3AED',
          notes: input.notes || null,
          created_by: input.createdBy,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating tag:', error);
        return null;
      }

      return evidenceTagToCamelCase(data as EvidenceTagRow);
    } catch (error) {
      console.error('Error in createTag:', error);
      return null;
    }
  }

  static async getFileTags(
    caseId: string,
    fileHash: string
  ): Promise<EvidenceTag[]> {
    const { data, error } = await supabase
      .from('evidence_tags')
      .select('*')
      .eq('case_id', caseId)
      .eq('file_hash', fileHash)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching tags:', error);
      return [];
    }

    return data.map((row) => evidenceTagToCamelCase(row as EvidenceTagRow));
  }

  static async getCaseTags(caseId: string): Promise<EvidenceTag[]> {
    const { data, error } = await supabase
      .from('evidence_tags')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching case tags:', error);
      return [];
    }

    return data.map((row) => evidenceTagToCamelCase(row as EvidenceTagRow));
  }

  static async deleteTag(tagId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('evidence_tags')
        .delete()
        .eq('id', tagId);

      return !error;
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  }

  static async updateTag(
    tagId: string,
    updates: { tagName?: string; tagColor?: string; notes?: string }
  ): Promise<EvidenceTag | null> {
    try {
      const updateData: any = {};
      if (updates.tagName !== undefined) updateData.tag_name = updates.tagName;
      if (updates.tagColor !== undefined) updateData.tag_color = updates.tagColor;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('evidence_tags')
        .update(updateData)
        .eq('id', tagId)
        .select()
        .single();

      if (error) {
        console.error('Error updating tag:', error);
        return null;
      }

      return evidenceTagToCamelCase(data as EvidenceTagRow);
    } catch (error) {
      console.error('Error in updateTag:', error);
      return null;
    }
  }

  static async getAllUniqueTagNames(caseId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('evidence_tags')
      .select('tag_name')
      .eq('case_id', caseId);

    if (error || !data) {
      return [];
    }

    return [...new Set(data.map((row) => row.tag_name))];
  }
}
