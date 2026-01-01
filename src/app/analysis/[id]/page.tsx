'use client';

import React, { useMemo } from 'react';
import { AppShell } from '../../../components/app-shell';
import { MetadataDisplay } from '../../../components/metadata-display';
import { useAnalysis } from '../../../lib/hooks/queries/use-analyses';
import { FileAnalysis } from '../../../lib/types';
import { FileSearchRecord } from '../../../lib/types/database';
import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Adapter function to convert FileSearchRecord to FileAnalysis
function toFileAnalysis(record: FileSearchRecord): FileAnalysis {
  return {
    id: record.id,
    timestamp: new Date(record.analyzedAt).getTime(),
    file: {
      name: record.fileName,
      size: record.fileSize,
      type: record.fileType,
      lastModified: new Date(record.analyzedAt).getTime(),
    },
    hash: {
      md5: '', // Not stored in search index
      sha256: record.fileHash,
    },
    metadata: {}, // Metadata is flattened in search index
    mimeType: record.fileType,
    fileSignatureMatch: true,
  };
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const router = useRouter();

  const { data: analysisData, isLoading, isError } = useAnalysis(id);

  // Convert FileSearchRecord to FileAnalysis
  const analysis = useMemo(() =>
    analysisData ? toFileAnalysis(analysisData) : null,
    [analysisData]
  );

  const handleGenerateReport = async () => {
    if (!analysis) return;

    try {
      // Import the report generator
      const { generateReport } = await import('../../../lib/services/report-generator');

      const reportOptions = {
        title: `Analysis Report: ${analysis.file.name}`,
        includeMetadata: true,
        includeHashes: true,
        includeFileSignature: true,
        examinerName: "", // Could be populated from user profile in a full implementation
        notes: "",
      };

      const reportBlob = await generateReport(analysis, reportOptions);

      // Create a download link for the report
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analysis_report_${analysis.file.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forensic"></div>
        </div>
      </AppShell>
    );
  }

  if (!analysis) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium text-gray-900">Analysis not found</h2>
          <p className="mt-2 text-gray-600">The analysis you're looking for doesn't exist or has been deleted.</p>
          <Link 
            href="/dashboard"
            className="mt-4 inline-flex items-center text-forensic hover:text-forensic-dark"
            aria-label="Return to dashboard"
            tabIndex={0}
          >
            <FiArrowLeft className="mr-2" />
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back button and page header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-forensic"
              aria-label="Back to dashboard"
              tabIndex={0}
            >
              <FiArrowLeft className="mr-1 h-4 w-4" />
              <span>Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{analysis.file.name}</h1>
            <p className="text-sm text-gray-500">
              Analyzed on {new Date(analysis.timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              aria-label="Generate report"
              tabIndex={0}
            >
              <FiFileText className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
            
            <Link
              href={`/reports/${analysis.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-forensic text-white rounded-md hover:bg-forensic-dark transition-colors shadow-sm"
              aria-label="Create detailed report"
              tabIndex={0}
            >
              <FiDownload className="h-4 w-4" />
              <span>Full Report</span>
            </Link>
          </div>
        </div>

        {/* Analysis display */}
        <MetadataDisplay analysis={analysis} />
      </div>
    </AppShell>
  );
} 