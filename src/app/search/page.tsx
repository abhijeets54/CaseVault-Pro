'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { useCases } from '@/lib/hooks/queries/use-cases';
import { useSearch } from '@/lib/hooks/queries/use-search';
import { SearchBar } from '@/components/search/search-bar';
import { Search as SearchIcon, FileText, AlertCircle } from 'lucide-react';
import { SearchFilters } from '@/lib/types';
import { formatBytes, formatDate } from '@/lib/utils';

export default function SearchPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters | undefined>();

  const { data: cases = [] } = useCases();
  const { data: results = [], isLoading } = useSearch(
    selectedCaseId,
    searchQuery,
    searchFilters
  );

  const handleSearch = (query: string, filters?: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <SearchIcon className="text-brand-secondary" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Search Evidence</h1>
            <p className="text-gray-400">Full-text search with advanced filtering</p>
          </div>
        </div>

        <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Search in Case</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full px-4 py-3 bg-brand-darkBg border border-brand-darkBorder rounded-lg text-white focus:border-brand-secondary outline-none"
          >
            <option value="">-- Select a case --</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.caseName}
              </option>
            ))}
          </select>
        </div>

        {selectedCaseId && (
          <>
            <SearchBar onSearch={handleSearch} />

            {isLoading && (
              <div className="text-center py-12 text-gray-400">Searching...</div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Found {results.length} result{results.length === 1 ? '' : 's'}
                </p>
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-4 hover:border-brand-secondary transition"
                  >
                    <div className="flex items-start gap-4">
                      <FileText className="text-brand-secondary flex-shrink-0" size={24} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {result.fileName}
                        </h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <span className="ml-2 text-white">{result.fileType}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Size:</span>
                            <span className="ml-2 text-white">
                              {formatBytes(result.fileSize)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Extension:</span>
                            <span className="ml-2 text-white">
                              {result.fileExtension || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Analyzed:</span>
                            <span className="ml-2 text-white">
                              {formatDate(result.analyzedAt)}
                            </span>
                          </div>
                        </div>
                        {result.tags.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {result.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-brand-secondary/20 text-brand-secondary text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && searchQuery && results.length === 0 && (
              <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-400">No files found matching your search.</p>
              </div>
            )}
          </>
        )}

        {!selectedCaseId && (
          <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-12 text-center">
            <SearchIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400">Select a case to start searching.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
