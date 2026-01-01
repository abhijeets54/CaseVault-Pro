'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AppShell } from '@/components/app-shell';
import { ReportGeneratorForm } from '@/components/reports/report-generator-form';
import { ReportProgress } from '@/components/reports/report-progress';
import { useCase } from '@/lib/hooks/queries/use-cases';
import { useGenerateReport } from '@/lib/hooks/queries/use-reports';
import { ReportGenerator } from '@/lib/services/report-generator-v2';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function GenerateReportContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const { user } = useUser();

  const { data: caseData, isLoading: caseLoading } = useCase(caseId);
  const generateReportMutation = useGenerateReport();

  const [stage, setStage] = useState<'idle' | 'fetching' | 'generating' | 'saving' | 'complete'>('idle');
  const [generatedFileName, setGeneratedFileName] = useState<string>('');

  const handleGenerateReport = async (values: { format: 'pdf' | 'json' | 'csv'; includeCOC: boolean }) => {
    if (!caseId || !user) return;

    try {
      setStage('fetching');

      // Generate report using the mutation
      setStage('generating');
      const result = await generateReportMutation.mutateAsync({
        caseId,
        format: values.format,
        includeCOC: values.includeCOC,
        userEmail: user.primaryEmailAddress?.emailAddress || 'unknown@casevault.pro',
        userName: user.fullName || 'Unknown User',
      });

      setStage('saving');

      // Download the file
      const mimeTypes = {
        pdf: 'application/pdf',
        json: 'application/json',
        csv: 'text/csv',
      };

      ReportGenerator.downloadFile(result.blob, result.fileName, mimeTypes[values.format]);

      setStage('complete');
      setGeneratedFileName(result.fileName);

      toast.success('Report generated successfully!', {
        description: `${result.fileName} has been downloaded.`,
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setStage('idle');
        setGeneratedFileName('');
      }, 3000);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      setStage('idle');
    }
  };

  if (caseLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary"></div>
          <p className="text-muted-foreground">Loading case...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">Case Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested case could not be found.</p>
        <Link href="/reports">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/reports"
        className="inline-flex items-center text-brand-secondary hover:text-brand-secondary/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Reports
      </Link>

      {/* Page header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand-secondary" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Generate Report</h1>
            <p className="text-muted-foreground mb-2">
              Create a professional forensic report for case: <span className="font-medium text-foreground">{caseData.caseName}</span>
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{caseData.caseNumber}</span>
              <span>•</span>
              <span>{caseData.totalFiles} files</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report form or progress */}
      {stage === 'idle' ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <ReportGeneratorForm
            onSubmit={handleGenerateReport}
            isGenerating={generateReportMutation.isPending}
          />
        </div>
      ) : (
        <ReportProgress
          stage={stage}
          fileName={generatedFileName}
        />
      )}

      {/* Info card */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          About Report Formats
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li><strong>PDF:</strong> Formatted report with tables and chain of custody records</li>
          <li><strong>JSON:</strong> Machine-readable format with complete case data structure</li>
          <li><strong>CSV:</strong> Spreadsheet format with file details and COC events</li>
        </ul>
      </div>
    </div>
  );
}

export default function GenerateReportPage() {
  return (
    <AppShell
      pageTitle="Generate Report"
      pageDescription="Create professional forensic reports with chain of custody"
      backgroundVariant="grid"
    >
      <div className="container mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary"></div>
            </div>
          }
        >
          <GenerateReportContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
