import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchService } from '@/lib/services/search';
import { SearchFilters } from '@/lib/types';

export function useSearch(caseId: string, query: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: ['search', caseId, query, filters],
    queryFn: () => SearchService.search(caseId, query, filters),
    enabled: !!caseId,
    staleTime: 30000,
  });
}

export function useIndexFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      caseId,
      fileHash,
      fileName,
      fileType,
      fileSize,
      metadata,
      tags,
    }: {
      caseId: string;
      fileHash: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      metadata: any;
      tags?: string[];
    }) =>
      SearchService.indexFile(caseId, fileHash, fileName, fileType, fileSize, metadata, tags),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['search', variables.caseId] });
    },
  });
}

export function useUpdateFileTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileHash, tags }: { fileHash: string; tags: string[] }) =>
      SearchService.updateTags(fileHash, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}

export function useDeleteFileFromIndex() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileHash: string) => SearchService.deleteFile(fileHash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });
}
