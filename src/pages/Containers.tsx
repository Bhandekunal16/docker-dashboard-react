import React from 'react';
import { useContainers } from '../hooks/useContainers';
import { ContainerList } from '../components/containers/ContainerList';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { parseApiErrorMessage } from '../api/client';
import { Box, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Containers: React.FC = () => {
  const {
    data: containers = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useContainers();

  return (
    <div className="space-y-5">
      {/* Top Title & Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>Docker Containers</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {containers.length}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Manage container lifecycle, inspect ports, and stream live stdout/stderr logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Refresh Containers
          </Button>
        </div>
      </div>

      {/* Content */}
      {isError && !containers.length ? (
        <ErrorState
          title="Failed to Load Containers"
          message={parseApiErrorMessage(error)}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : (
        <ContainerList
          containers={containers}
          onRefresh={() => refetch()}
          isLoading={isFetching}
        />
      )}
    </div>
  );
};
