import React from 'react';
import { Search, X, Filter } from 'lucide-react';

interface ContainerFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'running' | 'stopped';
  setStatusFilter: (filter: 'all' | 'running' | 'stopped') => void;
  counts: {
    all: number;
    running: number;
    stopped: number;
  };
}

export const ContainerFilterBar: React.FC<ContainerFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  counts,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by container name, ID, or image..."
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 shrink-0 text-xs font-medium">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setStatusFilter('running')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            statusFilter === 'running'
              ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/60 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Running ({counts.running})
        </button>
        <button
          onClick={() => setStatusFilter('stopped')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            statusFilter === 'stopped'
              ? 'bg-zinc-800 text-zinc-300 font-semibold shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Stopped ({counts.stopped})
        </button>
      </div>
    </div>
  );
};
