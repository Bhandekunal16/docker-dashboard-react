import React from 'react';

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1">
          <div className="w-20 sm:w-24 h-3 bg-zinc-800 rounded" />
          <div className="mt-1.5 w-12 sm:w-16 h-6 bg-zinc-800 rounded" />
        </div>
        <div className="w-9 h-9 bg-zinc-800 rounded-lg shrink-0" />
      </div>
      <div className="hidden sm:block mt-2.5 pt-2 border-t border-zinc-800/40 w-32 h-3 bg-zinc-800/60 rounded" />
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-zinc-850/80 border-b border-zinc-800 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-zinc-800 rounded flex-1" />
        ))}
      </div>
      <div className="divide-y divide-zinc-800/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 flex items-center px-4 gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={`h-4 bg-zinc-800/60 rounded ${c === 0 ? 'w-24' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
