import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CaseService } from '@/lib/services/cases';
import { CreateCaseInput, UpdateCaseInput } from '@/lib/types';
import { useUser } from '@clerk/nextjs';

export function useCases() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['cases', user?.id],
    queryFn: () => CaseService.getCases(user!.id),
    enabled: !!user,
  });
}

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ['case', caseId],
    queryFn: () => CaseService.getCase(caseId),
    enabled: !!caseId,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: (input: CreateCaseInput) => CaseService.createCase(input, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, updates }: { caseId: string; updates: UpdateCaseInput }) =>
      CaseService.updateCase(caseId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) => CaseService.deleteCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
  });
}

export function useCaseStats() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['case-stats', user?.id],
    queryFn: () => CaseService.getCaseStats(user!.id),
    enabled: !!user,
  });
}
