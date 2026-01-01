'use client';

import { useParams } from 'next/navigation';
import { useReport, useDownloadReport, useDeleteReport } from '@/lib/hooks/queries/use-reports';
import { useCase } from '@/lib/hooks/queries/use-cases';
import { AppShell } from '@/components/app-shell';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, FileText, Calendar, User, Database, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatBytes } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const { data: report, isLoading: reportLoading } = useReport(reportId);
  const { data: caseData } = useCase(report?.caseId || null);
  const downloadMutation = useDownloadReport();
  const deleteMutation = useDeleteReport();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDownload = async () => {
    if (!report) return;

    try {
      await downloadMutation.mutateAsync(report.id);

      // Note: In a real implementation, you'd fetch the actual file from storage
      // For now, we'll show a success message
      toast.info('Download initiated', {
        description: 'Report download functionality requires storage integration.',
      });
    } catch (error) {
      toast.error('Failed to initiate download', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleDelete = async () => {
    if (!report) return;

    try {
      await deleteMutation.mutateAsync(report.id);
      toast.success('Report deleted successfully');

      // Redirect to reports page
      window.location.href = '/reports';
    } catch (error) {
      toast.error('Failed to delete report', {
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  if (reportLoading) {
    return (
      <AppShell
        pageTitle="Report Details"
        pageDescription="View and download report"
        backgroundVariant="grid"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary"></div>
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!report) {
    return (
      <AppShell
        pageTitle="Report Not Found"
        pageDescription="The requested report could not be found"
        backgroundVariant="grid"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested report could not be found.</p>
            <Link href="/reports">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      pageTitle="Report Details"
      pageDescription={`View and download ${report.fileName}`}
      backgroundVariant="grid"
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back button */}
        <Link
          href="/reports"
          className="inline-flex items-center text-brand-secondary hover:text-brand-secondary/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Link>

        {/* Report Header */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-lg bg-brand-secondary/10 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-brand-secondary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold mb-2 break-words">{report.fileName}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-mono">
                    {report.reportType.toUpperCase()}
                  </Badge>
                  {report.includesCoc && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Chain of Custody
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated {formatDate(report.generatedAt)} • {formatBytes(report.fileSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadMutation.isPending ? 'Downloading...' : 'Download Report'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Report Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Case Information */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-secondary" />
              Case Information
            </h2>
            {caseData ? (
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Case Name</dt>
                  <dd className="text-sm font-medium">
                    <Link
                      href={`/cases`}
                      className="text-brand-secondary hover:underline"
                    >
                      {caseData.caseName}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Case Number</dt>
                  <dd className="text-sm font-medium font-mono">{caseData.caseNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Case Officer</dt>
                  <dd className="text-sm font-medium">{caseData.caseOfficer}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="text-sm">
                    <Badge variant={caseData.caseStatus === 'active' ? 'default' : 'secondary'}>
                      {caseData.caseStatus}
                    </Badge>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Loading case information...</p>
            )}
          </div>

          {/* Report Statistics */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-secondary" />
              Report Statistics
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">Files Included</dt>
                <dd className="text-2xl font-bold text-brand-secondary">{report.fileCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Downloads</dt>
                <dd className="text-2xl font-bold text-brand-secondary">{report.downloadCount}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Generated By</dt>
                <dd className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {report.generatedBy}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Format Details */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">About This Format</h2>
          {report.reportType === 'pdf' && (
            <p className="text-sm text-muted-foreground">
              PDF format provides a professionally formatted report with case information, file details,
              metadata tables, and optional chain of custody records. Ideal for court submissions and
              official documentation.
            </p>
          )}
          {report.reportType === 'json' && (
            <p className="text-sm text-muted-foreground">
              JSON format provides a machine-readable export of all case data, including full metadata
              structures and chain of custody events. Perfect for integration with other systems or
              programmatic analysis.
            </p>
          )}
          {report.reportType === 'csv' && (
            <p className="text-sm text-muted-foreground">
              CSV format exports file details and chain of custody events in spreadsheet-compatible format.
              Suitable for data analysis, filtering, and integration with Excel or database systems.
            </p>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-2">Delete Report?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this report? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete Report'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
