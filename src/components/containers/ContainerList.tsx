import React, { useState, useMemo } from 'react';
import { Container } from '../../types/container';
import { ContainerFilterBar } from './ContainerFilterBar';
import { ContainerTableRow } from './ContainerTableRow';
import { ContainerCard } from './ContainerCard';
import { useContainerMutations } from '../../hooks/useContainers';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { parseContainerStatus } from '../../utils/formatters';

interface ContainerListProps {
  containers: Container[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ContainerList: React.FC<ContainerListProps> = ({
  containers,
  onRefresh,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all');
  const [containerToRemove, setContainerToRemove] = useState<Container | null>(null);

  const {
    startContainer,
    stopContainer,
    restartContainer,
    removeContainer,
    isStarting,
    isStopping,
    isRestarting,
    isRemoving,
    startingContainerId,
    stoppingContainerId,
    restartingContainerId,
    removingContainerId,
  } = useContainerMutations();

  const counts = useMemo(() => {
    let running = 0;
    let stopped = 0;
    for (const c of containers) {
      const { category } = parseContainerStatus(c.status);
      if (category === 'running') running++;
      else stopped++;
    }
    return {
      all: containers.length,
      running,
      stopped,
    };
  }, [containers]);

  const filteredContainers = useMemo(() => {
    return containers.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.container_id && c.container_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.image && c.image.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      const { category } = parseContainerStatus(c.status);
      if (statusFilter === 'running') return category === 'running';
      if (statusFilter === 'stopped') return category !== 'running';

      return true;
    });
  }, [containers, searchQuery, statusFilter]);

  const handleConfirmRemove = async () => {
    if (!containerToRemove) return;
    try {
      await removeContainer({ containerId: containerToRemove.container_id });
      setContainerToRemove(null);
    } catch {
      // handled by mutation error toast
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and search toolbar */}
      <ContainerFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        counts={counts}
      />

      {/* Main Containers Container */}
      {filteredContainers.length === 0 ? (
        <EmptyState
          icon="container"
          title={searchQuery || statusFilter !== 'all' ? 'No matching containers' : 'No containers found'}
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try changing your search query or status filter.'
              : 'There are currently no Docker containers found on this host.'
          }
          actionLabel={onRefresh ? 'Refresh Containers' : undefined}
          onAction={onRefresh}
          isLoading={isLoading}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 bg-zinc-950/80 select-none">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold w-28">Container ID</th>
                    <th className="py-2.5 px-3.5 font-semibold">Name</th>
                    <th className="py-2.5 px-3.5 font-semibold">Image</th>
                    <th className="py-2.5 px-3.5 font-semibold w-36">Status</th>
                    <th className="py-2.5 px-3.5 font-semibold">Ports</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredContainers.map((container) => (
                    <ContainerTableRow
                      key={container.container_id}
                      container={container}
                      onStart={(id) => startContainer({ containerId: id })}
                      onStop={(id) => stopContainer({ containerId: id })}
                      onRestart={(id) => restartContainer({ containerId: id })}
                      onRemove={(c) => setContainerToRemove(c)}
                      isStarting={isStarting && startingContainerId === container.container_id}
                      isStopping={isStopping && stoppingContainerId === container.container_id}
                      isRestarting={isRestarting && restartingContainerId === container.container_id}
                      isRemoving={isRemoving && removingContainerId === container.container_id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredContainers.map((container) => (
              <ContainerCard
                key={container.container_id}
                container={container}
                onStart={(id) => startContainer({ containerId: id })}
                onStop={(id) => stopContainer({ containerId: id })}
                onRestart={(id) => restartContainer({ containerId: id })}
                onRemove={(c) => setContainerToRemove(c)}
                isStarting={isStarting && startingContainerId === container.container_id}
                isStopping={isStopping && stoppingContainerId === container.container_id}
                isRestarting={isRestarting && restartingContainerId === container.container_id}
                isRemoving={isRemoving && removingContainerId === container.container_id}
              />
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal for Container Removal */}
      <ConfirmDialog
        isOpen={Boolean(containerToRemove)}
        onClose={() => setContainerToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Container?"
        variant="danger"
        confirmLabel="Remove Container"
        isLoading={isRemoving}
        description={
          <div>
            Are you sure you want to permanently remove container{' '}
            <strong className="text-zinc-100 font-mono">
              {containerToRemove?.name || containerToRemove?.container_id.slice(0, 12)}
            </strong>
            ? This action cannot be undone.
            <div className="mt-3 p-2 rounded bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-zinc-400">
              docker rm {containerToRemove?.container_id.slice(0, 12)}
            </div>
          </div>
        }
      />
    </div>
  );
};
