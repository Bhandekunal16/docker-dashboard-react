import React from 'react';
import { useImages } from '../hooks/useImages';
import { ImageList } from '../components/images/ImageList';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { parseApiErrorMessage } from '../api/client';
import { Package, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Images: React.FC = () => {
  const {
    data: images = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useImages();

  return (
    <div className="space-y-5">
      {/* Top Title & Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-950/70 text-blue-400 border border-blue-800/60">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <span>Docker Images</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {images.length}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Inspect cached image layers, repository tags, size breakdown, and purge unneeded images
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
            Refresh Images
          </Button>
        </div>
      </div>

      {/* Content */}
      {isError && !images.length ? (
        <ErrorState
          title="Failed to Load Docker Images"
          message={parseApiErrorMessage(error)}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : (
        <ImageList
          images={images}
          onRefresh={() => refetch()}
          isLoading={isFetching}
        />
      )}
    </div>
  );
};
