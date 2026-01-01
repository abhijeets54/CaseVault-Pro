'use client';

import { useState } from 'react';
import { useCases } from '@/lib/hooks/queries/use-cases';
import { useReportHistory } from '@/lib/hooks/queries/use-reports';
import Link from 'next/link';
import { FileText, Folder, ChevronRight, Search, X, Download, Trash2, Calendar, User } from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Fetch report history for selected case
  const { data: reports = [], isLoading: reportsLoading } = useReportHistory(selectedCaseId);

  // Filter cases based on search term
  const filteredCases = cases.filter((caseItem) =>
    caseItem.caseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <AppShell
      pageTitle="Reports"
      pageDescription="Generate and manage forensic reports for your cases"
      backgroundVariant="grid"
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent mb-2">
            Reports
          </h1>
          <p className="text-muted-foreground">
            Generate professional forensic reports with chain of custody records in PDF, JSON, or CSV formats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border shadow-sm">
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Folder className="w-5 h-5 text-brand-secondary" />
                  Cases
                </h2>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 py-2 border border-border rounded-md w-full bg-background focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Cases list */}
              <div className="max-h-96 overflow-y-auto">
                {casesLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading cases...
                  </div>
                ) : filteredCases.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {filteredCases.map((caseItem) => (
                      <li key={caseItem.id}>
                        <button
                          onClick={() => setSelectedCaseId(caseItem.id)}
                          className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                            selectedCaseId === caseItem.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium truncate">
                                {caseItem.caseName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {caseItem.caseNumber}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={caseItem.caseStatus === 'active' ? 'default' : 'secondary'}>
                                  {caseItem.caseStatus}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {caseItem.totalFiles} files
                                </span>
                              </div>
                            </div>
                            {selectedCaseId === caseItem.id && (
                              <ChevronRight className="w-4 h-4 text-brand-secondary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center">
                    {searchTerm ? (
                      <p className="text-muted-foreground text-sm">No cases match your search.</p>
                    ) : (
                      <div>
                        <p className="text-muted-foreground text-sm mb-3">No cases available.</p>
                        <Link href="/cases">
                          <Button variant="outline" size="sm">
                            Create a case
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Report History & Actions */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="space-y-6">
                {/* Case Header */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-2">{selectedCase.caseName}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedCase.caseNumber} • {selectedCase.caseOfficer}
                  </p>
                  <Link href={`/reports/generate?caseId=${selectedCase.id}`}>
                    <Button className="w-full sm:w-auto">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate New Report
                    </Button>
                  </Link>
                </div>

                {/* Report History */}
                <div className="bg-card rounded-lg border border-border shadow-sm">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold">Report History</h3>
                  </div>

                  {reportsLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading reports...
                    </div>
                  ) : reports.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {reports.map((report) => (
                        <li key={report.id} className="p-4 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-brand-secondary flex-shrink-0" />
                                <h4 className="text-sm font-medium truncate">
                                  {report.fileName}
                                </h4>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline">{report.reportType.toUpperCase()}</Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>{formatBytes(report.fileSize)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(report.generatedAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Download className="w-3 h-3" />
                                  <span>{report.downloadCount} downloads</span>
                                </div>
                              </div>
                              {report.includesCoc && (
                                <Badge variant="secondary" className="mt-2">
                                  Includes Chain of Custody
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Link href={`/reports/${report.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-muted-foreground text-sm mb-3">
                        No reports generated for this case yet.
                      </p>
                      <Link href={`/reports/generate?caseId=${selectedCase.id}`}>
                        <Button variant="outline" size="sm">
                          Generate First Report
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border shadow-sm p-12 text-center">
                <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Case</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a case from the list to view its report history and generate new reports.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
