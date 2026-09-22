import React from 'react';
import { Box, Play, Square, Package, RefreshCw } from 'lucide-react';
import { useContainers } from '../hooks/useContainers';
import { useImages } from '../hooks/useImages';
import { StatCard } from '../components/dashboard/StatCard';
import { StatusOverview } from '../components/dashboard/StatusOverview';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentContainers } from '../components/dashboard/RecentContainers';
import { StatCardSkeleton, TableSkeleton } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { parseContainerStatus } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { parseApiErrorMessage } from '../api/client';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: containers = [],
    isLoading: isContainersLoading,
    isError: isContainersError,
    error: containersError,
    refetch: refetchContainers,
    isFetching: isContainersFetching,
  } = useContainers();

  const {
    data: images = [],
    isLoading: isImagesLoading,
    isError: isImagesError,
    error: imagesError,
    refetch: refetchImages,
    isFetching: isImagesFetching,
  } = useImages();

  const isLoading = isContainersLoading || isImagesLoading;
  const isFetching = isContainersFetching || isImagesFetching;

  // Calculate statistics
  const totalContainers = containers.length;
  const runningContainers = containers.filter(
    (c) => parseContainerStatus(c.status).category === 'running'
  ).length;
  const stoppedContainers = containers.filter(
    (c) => parseContainerStatus(c.status).category === 'stopped'
  ).length;
  const totalImages = images.length;

  const handleRetryAll = () => {
    refetchContainers();
    refetchImages();
  };

  if (isContainersError && isImagesError && !containers.length && !images.length) {
    return (
      <ErrorState
        title="Failed to Connect to Docker Engine"
        message={parseApiErrorMessage(containersError || imagesError)}
        onRetry={handleRetryAll}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Stat Cards Grid: 1 col (320px-399px), 2 cols (400px-639px / sm), 4 cols (1024px+ / lg) */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Containers"
              value={totalContainers}
              subtitle="All registered containers"
              icon={<Box className="w-5 h-5 sm:w-6 sm:h-6" />}
              variant="blue"
              onClick={() => navigate('/containers')}
            />
            <StatCard
              title="Running Containers"
              value={runningContainers}
              subtitle="Active & responding"
              icon={<Play className="w-5 h-5 sm:w-6 sm:h-6" />}
              variant="emerald"
              onClick={() => navigate('/containers')}
            />
            <StatCard
              title="Stopped Containers"
              value={stoppedContainers}
              subtitle="Exited or idle"
              icon={<Square className="w-5 h-5 sm:w-6 sm:h-6" />}
              variant="zinc"
              onClick={() => navigate('/containers')}
            />
            <StatCard
              title="Docker Images"
              value={totalImages}
              subtitle="Cached repository tags"
              icon={<Package className="w-5 h-5 sm:w-6 sm:h-6" />}
              variant="amber"
              onClick={() => navigate('/images')}
            />
          </>
        )}
      </div>

      {/* Middle Row: Status Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <TableSkeleton rows={3} columns={3} />
          ) : (
            <StatusOverview containers={containers} images={images} />
          )}
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Bottom Row: Recent Containers List */}
      <div>
        {isLoading ? (
          <TableSkeleton rows={4} columns={5} />
        ) : (
          <RecentContainers containers={containers} isLoading={isContainersFetching} />
        )}
      </div>
    </div>
  );
};
