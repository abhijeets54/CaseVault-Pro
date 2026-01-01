"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAnalyses, useDeleteAnalysis } from '@/lib/hooks/queries/use-analyses';
import { AnalysisHistoryTable } from '@/components/analysis-history-table';
import { FileMetadata, FileAnalysis } from '@/lib/types';
import { FileSearchRecord } from '@/lib/types/database';
import Link from 'next/link';
import { FiUpload, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { AppShell } from '@/components/app-shell';
import { useToast } from '@/lib/hooks/use-toast';

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
      md5: '', // Not stored in search index, will need to fetch from COC if needed
      sha256: record.fileHash,
    },
    metadata: {}, // Metadata is flattened in search index
    mimeType: record.fileType,
    fileSignatureMatch: true, // Assume true, can enhance later
  };
}

export default function AnalysisPage() {
  const { data: analysesData = [], isLoading } = useAnalyses();
  const deleteAnalysisMutation = useDeleteAnalysis();
  const { addToast } = useToast();

  // Convert FileSearchRecord[] to FileAnalysis[]
  const analyses = useMemo(() => analysesData.map(toFileAnalysis), [analysesData]);
  const [filteredAnalyses, setFilteredAnalyses] = useState(analyses);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FileMetadata | 'timestamp';
    direction: 'asc' | 'desc';
  }>({
    key: 'timestamp',
    direction: 'desc',
  });
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{id: string, fileName: string} | null>(null);

  // Get unique file types for filtering
  const fileTypes = [...new Set(analyses.map(a => a.file.type || 'Unknown'))];

  // Update filtered analyses when analyses change or filters change
  useEffect(() => {
    let result = [...analyses];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        a => a.file.name.toLowerCase().includes(term) ||
             (a.file.type && a.file.type.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (filterType) {
      result = result.filter(a => 
        filterType === 'Unknown' 
          ? !a.file.type || a.file.type === '' 
          : a.file.type === filterType
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'timestamp') {
        aValue = a.timestamp;
        bValue = b.timestamp;
      } else {
        aValue = a.file[sortConfig.key];
        bValue = b.file[sortConfig.key];
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      return sortConfig.direction === 'asc'
        ? (aValue ?? 0) - (bValue ?? 0)
        : (bValue ?? 0) - (aValue ?? 0);
    });

    setFilteredAnalyses(result);
  }, [analyses, searchTerm, filterType, sortConfig]);

  const handleSort = (key: keyof FileMetadata | 'timestamp') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Step 1: Request confirmation
  const handleDelete = (id: string) => {
    const analysis = analyses.find(a => a.id === id);
    if (!analysis) return;
    
    setDeleteConfirmation({ id, fileName: analysis.file.name });
    
    addToast({
      title: 'Confirm deletion',
      description: `Delete analysis for "${analysis.file.name}"? This action cannot be undone.`,
      variant: 'warning',
      duration: 10000 // Longer duration for user to read and decide
    });
  };
  
  // Step 2: Execute deletion when confirmed
  const confirmDeletion = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteAnalysisMutation.mutateAsync(deleteConfirmation.id);

      addToast({
        title: 'Analysis deleted',
        description: `Analysis for "${deleteConfirmation.fileName}" has been removed`,
        variant: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);

      addToast({
        title: 'Error',
        description: 'Failed to delete analysis. Please try again.',
        variant: 'error',
        duration: 5000
      });
    } finally {
      setDeleteConfirmation(null);
    }
  };
  
  // Cancel deletion
  const cancelDeletion = () => {
    setDeleteConfirmation(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType(null);
  };

  return (
    <AppShell
      pageTitle="Analysis History"
      pageDescription="View and manage your file analyses"
      backgroundVariant="grid"
    >
      <div className="container mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forensic"></div>
          </div>
        )}

        {!isLoading && (
          <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Analysis History</h1>
          <Link
            href="/upload"
            className="bg-forensic hover:bg-forensic-dark text-white px-4 py-2 rounded-md inline-flex items-center transition-colors"
          >
            <FiUpload className="mr-2" />
            Upload New File
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-forensic focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                >
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-forensic hover:text-forensic-dark transition-colors"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <FiFilter className="mr-1" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div id="filter-panel" className="pt-2 pb-1 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2 self-center">Filter by type:</span>
                <button
                  onClick={() => setFilterType(null)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filterType === null
                      ? 'bg-forensic text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {fileTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filterType === type
                        ? 'bg-forensic text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type || 'Unknown'}
                  </button>
                ))}
                {(searchTerm || filterType) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:underline ml-auto"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Deletion confirmation dialog */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the analysis for "{deleteConfirmation.fileName}"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDeletion}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletion}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <AnalysisHistoryTable
          analyses={filteredAnalyses}
          onDelete={handleDelete}
          onSort={handleSort}
          sortConfig={sortConfig}
        />

        {analyses.length > 0 && filteredAnalyses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No analyses match your current filters. Try adjusting your search or filter criteria.
          </div>
        )}

        {analyses.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4 text-gray-400">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
            <p className="text-gray-500 mb-6">Upload a file to begin analyzing evidence</p>
            <Link
              href="/upload"
              className="bg-forensic hover:bg-forensic-dark text-white px-4 py-2 rounded-md inline-flex items-center transition-colors"
            >
              <FiUpload className="mr-2" />
              Upload File
            </Link>
          </div>
        )}
          </>
        )}
      </div>
    </AppShell>
  );
}