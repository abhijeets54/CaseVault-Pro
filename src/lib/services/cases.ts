import { supabase } from '../supabase/client';
import {
  Case,
  CaseRow,
  CreateCaseInput,
  UpdateCaseInput,
  toCamelCase,
} from '../types';

export class CaseService {
  static async createCase(
    input: CreateCaseInput,
    userId: string
  ): Promise<Case> {
    const { data, error } = await supabase
      .from('cases')
      .insert({
        case_name: input.caseName,
        case_officer: input.caseOfficer,
        department: input.department || null,
        description: input.description || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating case:', error);
      throw new Error(error.message || 'Failed to create case');
    }

    if (!data) {
      throw new Error('No data returned from create operation');
    }

    return toCamelCase(data as CaseRow);
  }

  static async getCases(userId: string): Promise<Case[]> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching cases:', error);
      return [];
    }

    return data.map((row) => toCamelCase(row as CaseRow));
  }

  static async getCase(caseId: string): Promise<Case | null> {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !data) {
      console.error('Error fetching case:', error);
      return null;
    }

    return toCamelCase(data as CaseRow);
  }

  static async updateCase(
    caseId: string,
    updates: UpdateCaseInput
  ): Promise<Case> {
    const updateData: any = {};
    if (updates.caseName !== undefined) updateData.case_name = updates.caseName;
    if (updates.caseOfficer !== undefined)
      updateData.case_officer = updates.caseOfficer;
    if (updates.department !== undefined)
      updateData.department = updates.department;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.caseStatus !== undefined)
      updateData.case_status = updates.caseStatus;

    if (updates.caseStatus === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updateData)
      .eq('id', caseId)
      .select()
      .single();

    if (error) {
      console.error('Error updating case:', error);
      throw new Error(error.message || 'Failed to update case');
    }

    if (!data) {
      throw new Error('No data returned from update operation');
    }

    return toCamelCase(data as CaseRow);
  }

  static async deleteCase(caseId: string): Promise<void> {
    const { error } = await supabase.from('cases').delete().eq('id', caseId);

    if (error) {
      console.error('Error deleting case:', error);
      throw new Error(error.message || 'Failed to delete case');
    }
  }

  static async getCaseStats(userId: string): Promise<{
    totalCases: number;
    activeCases: number;
    closedCases: number;
    totalFiles: number;
    totalSize: number;
  }> {
    const cases = await this.getCases(userId);

    const stats = cases.reduce(
      (acc, c) => {
        acc.totalCases++;
        if (c.caseStatus === 'active') acc.activeCases++;
        if (c.caseStatus === 'closed') acc.closedCases++;
        acc.totalFiles += c.totalFiles;
        acc.totalSize += c.totalSize;
        return acc;
      },
      {
        totalCases: 0,
        activeCases: 0,
        closedCases: 0,
        totalFiles: 0,
        totalSize: 0,
      }
    );

    return stats;
  }
}
