import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaggingService } from '@/lib/services/tagging';
import { CreateTagInput } from '@/lib/types';
import { useUser } from '@clerk/nextjs';

export function useFileTags(caseId: string, fileHash: string) {
  return useQuery({
    queryKey: ['tags', 'file', caseId, fileHash],
    queryFn: () => TaggingService.getFileTags(caseId, fileHash),
    enabled: !!caseId && !!fileHash,
  });
}

export function useCaseTags(caseId: string) {
  return useQuery({
    queryKey: ['tags', 'case', caseId],
    queryFn: () => TaggingService.getCaseTags(caseId),
    enabled: !!caseId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: (input: CreateTagInput) =>
      TaggingService.createTag({ ...input, createdBy: user!.id }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tags', 'file', variables.caseId, variables.fileHash],
      });
      queryClient.invalidateQueries({ queryKey: ['tags', 'case', variables.caseId] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tagId,
      updates,
    }: {
      tagId: string;
      updates: { tagName?: string; tagColor?: string; notes?: string };
    }) => TaggingService.updateTag(tagId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => TaggingService.deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUniqueTagNames(caseId: string) {
  return useQuery({
    queryKey: ['tag-names', caseId],
    queryFn: () => TaggingService.getAllUniqueTagNames(caseId),
    enabled: !!caseId,
  });
}
