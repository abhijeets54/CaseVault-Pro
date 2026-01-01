// CaseVault Pro - Chain of Custody React Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChainOfCustodyService } from '@/lib/services/chain-of-custody';
import { COCEvent, ActivityType, IntegrityResult, RecordCOCInput } from '@/lib/types';
import { useUser } from '@clerk/nextjs';

/**
 * Fetch chain of custody for a specific file
 */
export function useFileChain(caseId: string, fileHash: string) {
  return useQuery({
    queryKey: ['chain-of-custody', 'file', caseId, fileHash],
    queryFn: () => ChainOfCustodyService.getFileChain(caseId, fileHash),
    enabled: !!caseId && !!fileHash,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch all chain of custody events for a case
 */
export function useCaseChain(caseId: string) {
  return useQuery({
    queryKey: ['chain-of-custody', 'case', caseId],
    queryFn: () => ChainOfCustodyService.getCaseChain(caseId),
    enabled: !!caseId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Verify chain integrity for a file
 */
export function useVerifyChainIntegrity(caseId: string, fileHash: string) {
  return useQuery({
    queryKey: ['chain-integrity', caseId, fileHash],
    queryFn: () => ChainOfCustodyService.verifyChainIntegrity(caseId, fileHash),
    enabled: !!caseId && !!fileHash,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get activity statistics for a case
 */
export function useCaseActivityStats(caseId: string) {
  return useQuery({
    queryKey: ['chain-stats', caseId],
    queryFn: () => ChainOfCustodyService.getCaseActivityStats(caseId),
    enabled: !!caseId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Record a new chain of custody event
 */
export function useRecordCOCEvent() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (input: RecordCOCInput) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      return ChainOfCustodyService.recordEvent({
        ...input,
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress || 'unknown',
        userFullName: user.fullName || user.firstName || 'Unknown User',
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['chain-of-custody', 'file', variables.caseId, variables.fileHash],
      });
      queryClient.invalidateQueries({
        queryKey: ['chain-of-custody', 'case', variables.caseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chain-stats', variables.caseId],
      });
      queryClient.invalidateQueries({
        queryKey: ['chain-integrity', variables.caseId, variables.fileHash],
      });
    },
  });
}

/**
 * Generate chain of custody certificate
 */
export function useGenerateCOCCertificate() {
  return useMutation({
    mutationFn: async ({
      caseId,
      fileHash,
      caseNumber,
      fileName,
    }: {
      caseId: string;
      fileHash: string;
      caseNumber: string;
      fileName: string;
    }) => {
      return ChainOfCustodyService.generateCertificate(
        caseId,
        fileHash,
        caseNumber,
        fileName
      );
    },
  });
}

/**
 * Helper hook to automatically record COC events
 */
export function useAutoRecordCOC(caseId: string) {
  const recordEvent = useRecordCOCEvent();

  const recordActivity = async (
    fileName: string,
    fileHash: string,
    activityType: ActivityType,
    metadata?: Record<string, any>
  ) => {
    try {
      await recordEvent.mutateAsync({
        caseId,
        fileName,
        fileHash,
        activityType,
        metadata,
      });
    } catch (error) {
      console.error('Failed to record COC event:', error);
    }
  };

  return {
    recordActivity,
    isRecording: recordEvent.isPending,
  };
}
