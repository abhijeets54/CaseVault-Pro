'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ReportExport, ReportExportRow, GenerateReportInput, ReportData } from '@/lib/types/database';
import { ReportGenerator } from '@/lib/services/report-generator-v2';
import { ChainOfCustodyService } from '@/lib/services/chain-of-custody';
import { SearchService } from '@/lib/services/search';

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (caseId: string) => [...reportKeys.lists(), caseId] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
};

// Convert database row to camelCase
function reportExportToCamelCase(row: ReportExportRow): ReportExport {
  return {
    id: row.id,
    caseId: row.case_id,
    reportType: row.report_type,
    fileName: row.file_name,
    fileSize: row.file_size,
    includesCoc: row.includes_coc,
    fileCount: row.file_count,
    generatedBy: row.generated_by,
    generatedAt: row.generated_at,
    downloadCount: row.download_count,
    storageUrl: row.storage_url,
  };
}

// Fetch report history for a case
async function fetchReportHistory(caseId: string): Promise<ReportExport[]> {
  const { data, error } = await supabase
    .from('report_exports')
    .select('*')
    .eq('case_id', caseId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(reportExportToCamelCase);
}

// Fetch single report
async function fetchReport(reportId: string): Promise<ReportExport> {
  const { data, error } = await supabase
    .from('report_exports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;
  return reportExportToCamelCase(data);
}

// Generate report and save metadata
async function generateReport(input: GenerateReportInput): Promise<{ blob: Blob; fileName: string; reportExport: ReportExport }> {
  const { caseId, format, includeCOC, userEmail, userName } = input;

  // 1. Fetch case data
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError) throw caseError;

  // 2. Fetch all files in the case
  const { data: filesData, error: filesError } = await supabase
    .from('file_search_index')
    .select('*')
    .eq('case_id', caseId)
    .order('indexed_at', { ascending: false });

  if (filesError) throw filesError;

  // 3. Optionally fetch COC for each file
  const filesWithCOC = await Promise.all(
    (filesData || []).map(async (file) => {
      let chainOfCustody = [];
      if (includeCOC) {
        chainOfCustody = await ChainOfCustodyService.getFileChain(caseId, file.file_hash);
      }

      return {
        fileName: file.file_name,
        fileHash: file.file_hash,
        fileSize: file.file_size,
        fileType: file.file_type,
        analysisDate: file.indexed_at,
        tags: file.tags || [],
        metadata: file.metadata_text ? JSON.parse(file.metadata_text) : {},
        chainOfCustody,
      };
    })
  );

  // 4. Build report data
  const reportData: ReportData = {
    caseInfo: {
      caseNumber: caseData.case_number,
      caseName: caseData.case_name,
      caseOfficer: caseData.case_officer,
      department: caseData.department || undefined,
      dateOpened: caseData.created_at,
      status: caseData.case_status,
    },
    summary: {
      totalFiles: filesData?.length || 0,
      totalSize: caseData.total_size || 0,
      generatedBy: userName || userEmail,
      analysisCompletedAt: new Date().toISOString(),
    },
    files: filesWithCOC,
    includeCOC,
  };

  // 5. Generate report blob
  let blob: Blob;
  let mimeType: string;
  let fileExtension: string;

  switch (format) {
    case 'pdf':
      blob = await ReportGenerator.generatePDF(reportData);
      mimeType = 'application/pdf';
      fileExtension = 'pdf';
      break;
    case 'json':
      blob = await ReportGenerator.generateJSON(reportData);
      mimeType = 'application/json';
      fileExtension = 'json';
      break;
    case 'csv':
      blob = await ReportGenerator.generateCSV(reportData);
      mimeType = 'text/csv';
      fileExtension = 'csv';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  // 6. Generate file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `${caseData.case_number}_report_${timestamp}.${fileExtension}`;

  // 7. Save report metadata to database
  const { data: reportExportData, error: insertError } = await supabase
    .from('report_exports')
    .insert({
      case_id: caseId,
      report_type: format,
      file_name: fileName,
      file_size: blob.size,
      includes_coc: includeCOC,
      file_count: filesData?.length || 0,
      generated_by: userEmail,
      download_count: 0,
      storage_url: null, // Can be updated later if stored in cloud storage
    })
    .select()
    .single();

  if (insertError) throw insertError;

  return {
    blob,
    fileName,
    reportExport: reportExportToCamelCase(reportExportData),
  };
}

// Increment download count
async function incrementDownloadCount(reportId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_report_download_count', {
    report_id: reportId,
  });

  // If RPC doesn't exist, do it manually
  if (error) {
    const { data: report } = await supabase
      .from('report_exports')
      .select('download_count')
      .eq('id', reportId)
      .single();

    if (report) {
      await supabase
        .from('report_exports')
        .update({ download_count: (report.download_count || 0) + 1 })
        .eq('id', reportId);
    }
  }
}

// Delete report
async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('report_exports')
    .delete()
    .eq('id', reportId);

  if (error) throw error;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch report history for a case
 */
export function useReportHistory(caseId: string | null) {
  return useQuery({
    queryKey: reportKeys.list(caseId || ''),
    queryFn: () => fetchReportHistory(caseId!),
    enabled: !!caseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single report
 */
export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: reportKeys.detail(reportId || ''),
    queryFn: () => fetchReport(reportId!),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to generate a new report
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateReport,
    onSuccess: (data) => {
      // Invalidate report history for this case
      queryClient.invalidateQueries({ queryKey: reportKeys.list(data.reportExport.caseId) });
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

/**
 * Hook to download a report (increments download count)
 */
export function useDownloadReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      await incrementDownloadCount(reportId);
      return reportId;
    },
    onSuccess: (reportId) => {
      // Invalidate the specific report to refresh download count
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
    },
  });
}

/**
 * Hook to delete a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      // Invalidate all report lists
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
