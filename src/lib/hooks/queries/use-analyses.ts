import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase/client';
import { FileSearchRecordRow, fileSearchRecordToCamelCase } from '@/lib/types/database';

/**
 * Hook to fetch all analyses for the current user
 */
export function useAnalyses() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['analyses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('file_search_index')
        .select(`
          *,
          case:cases!file_search_index_case_id_fkey (
            case_number,
            case_name
          )
        `)
        .order('analyzed_at', { ascending: false });

      if (error) {
        console.error('Error fetching analyses:', error);
        throw error;
      }

      return (data || []).map((row) => fileSearchRecordToCamelCase(row as FileSearchRecordRow));
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch a single analysis by ID
 */
export function useAnalysis(analysisId: string) {
  return useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_search_index')
        .select('*')
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('Error fetching analysis:', error);
        throw error;
      }

      return data ? fileSearchRecordToCamelCase(data as FileSearchRecordRow) : null;
    },
    enabled: !!analysisId,
  });
}

/**
 * Hook to fetch analyses for a specific case
 */
export function useCaseAnalyses(caseId: string) {
  return useQuery({
    queryKey: ['analyses', 'case', caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_search_index')
        .select('*')
        .eq('case_id', caseId)
        .order('analyzed_at', { ascending: false });

      if (error) {
        console.error('Error fetching case analyses:', error);
        throw error;
      }

      return (data || []).map((row) => fileSearchRecordToCamelCase(row as FileSearchRecordRow));
    },
    enabled: !!caseId,
    staleTime: 30000,
  });
}

/**
 * Hook to delete an analysis
 */
export function useDeleteAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analysisId: string) => {
      const { error } = await supabase
        .from('file_search_index')
        .delete()
        .eq('id', analysisId);

      if (error) {
        console.error('Error deleting analysis:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all analysis queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
}
