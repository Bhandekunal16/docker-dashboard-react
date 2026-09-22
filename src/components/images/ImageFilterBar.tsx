import React from 'react';
import { Search, X, Trash2, ArrowUpDown } from 'lucide-react';
import { Button } from '../common/Button';

interface ImageFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'tag' | 'size' | 'containers' | 'created';
  setSortBy: (sort: 'tag' | 'size' | 'containers' | 'created') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  isDeletingSelected?: boolean;
}

export const ImageFilterBar: React.FC<ImageFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCount,
  onDeleteSelected,
  isDeletingSelected,
}) => {
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by tag, ID, or digest..."
          className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-950 border border-zinc-750 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sort & Batch Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {selectedCount > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={onDeleteSelected}
            isLoading={isDeletingSelected}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Selected ({selectedCount})
          </Button>
        )}

        <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1.5 rounded-lg border border-zinc-800 text-xs">
          <span className="text-zinc-400 font-mono text-[11px]">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-zinc-200 font-mono text-xs focus:outline-none cursor-pointer"
          >
            <option value="tag" className="bg-zinc-900 text-zinc-100">Tag</option>
            <option value="size" className="bg-zinc-900 text-zinc-100">Size</option>
            <option value="containers" className="bg-zinc-900 text-zinc-100">Containers</option>
            <option value="created" className="bg-zinc-900 text-zinc-100">Created At</option>
          </select>

          <button
            onClick={toggleSortOrder}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            aria-label="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
