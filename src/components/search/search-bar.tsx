'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters } from '@/lib/types';

interface SearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search files...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
    onSearch(query, {});
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 bg-brand-darkCard border border-brand-darkBorder rounded-lg text-white placeholder-gray-400 focus:border-brand-secondary outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 font-medium"
        >
          Search
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg border ${
            showFilters
              ? 'bg-brand-secondary text-white border-brand-secondary'
              : 'bg-brand-darkCard text-gray-300 border-brand-darkBorder hover:bg-brand-darkBorder'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-brand-darkCard border border-brand-darkBorder rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <X size={14} />
              Clear
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">File Type</label>
              <input
                type="text"
                value={filters.fileType || ''}
                onChange={(e) => setFilters({ ...filters, fileType: e.target.value })}
                placeholder="e.g., image/jpeg"
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded text-white focus:border-brand-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Size (bytes)</label>
              <input
                type="number"
                value={filters.minSize || ''}
                onChange={(e) =>
                  setFilters({ ...filters, minSize: parseInt(e.target.value) || undefined })
                }
                placeholder="0"
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded text-white focus:border-brand-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Size (bytes)</label>
              <input
                type="number"
                value={filters.maxSize || ''}
                onChange={(e) =>
                  setFilters({ ...filters, maxSize: parseInt(e.target.value) || undefined })
                }
                placeholder="Unlimited"
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded text-white focus:border-brand-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom?.split('T')[0] || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded text-white focus:border-brand-secondary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo?.split('T')[0] || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateTo: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-brand-darkBg border border-brand-darkBorder rounded text-white focus:border-brand-secondary outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
