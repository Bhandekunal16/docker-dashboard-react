import React, { useState } from 'react';
import { Card, CardHeader } from '../common/Card';
import { Box, Play, Square, RotateCw, Terminal, ArrowRight } from 'lucide-react';
import { Container } from '../../types/container';
import { StatusBadge, TagBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { getShortId, parseContainerStatus } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';
import { useContainerMutations } from '../../hooks/useContainers';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../common/EmptyState';

export const RecentContainers: React.FC<{ containers: Container[]; isLoading?: boolean }> = ({
  containers,
  isLoading,
}) => {
  const { openLogs } = useConfig();
  const navigate = useNavigate();
  const {
    startContainer,
    stopContainer,
    restartContainer,
    isStarting,
    isStopping,
    isRestarting,
    startingContainerId,
    stoppingContainerId,
    restartingContainerId,
  } = useContainerMutations();

  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const displayedContainers = containers.slice(0, 5);

  const handleStart = async (id: string) => {
    setActiveActionId(id);
    try {
      await startContainer({ containerId: id });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleStop = async (id: string) => {
    setActiveActionId(id);
    try {
      await stopContainer({ containerId: id });
    } finally {
      setActiveActionId(null);
    }
  };

  const handleRestart = async (id: string) => {
    setActiveActionId(id);
    try {
      await restartContainer({ containerId: id });
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Recent Containers"
        subtitle="Quick overview of primary containers on this host"
        icon={<Box className="w-5 h-5 text-blue-400" />}
        action={
          containers.length > 5 ? (
            <button
              onClick={() => navigate('/containers')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All ({containers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null
        }
      />

      {containers.length === 0 ? (
        <EmptyState
          icon="container"
          title="No Containers Found"
          description="There are currently no active or stopped Docker containers on this host."
          actionLabel="Go to Containers"
          onAction={() => navigate('/containers')}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 bg-zinc-950/60 select-none">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-28">Container ID</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Image</th>
                <th className="py-2.5 px-3 font-semibold w-36">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {displayedContainers.map((container) => {
                const { category, isUp } = parseContainerStatus(container.status);
                const isMutatingThis =
                  (isStarting && startingContainerId === container.container_id) ||
                  (isStopping && stoppingContainerId === container.container_id) ||
                  (isRestarting && restartingContainerId === container.container_id);

                return (
                  <tr
                    key={container.container_id}
                    className="hover:bg-zinc-800/40 transition-colors group text-xs"
                  >
                    <td className="py-2.5 px-3 text-zinc-400 font-mono text-[11px] whitespace-nowrap">
                      {getShortId(container.container_id)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-zinc-100 max-w-[180px] truncate whitespace-nowrap">
                      {container.name || '-'}
                    </td>
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <TagBadge tag={container.image} maxWidth="max-w-[160px]" />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge category={category} label={container.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {isUp ? (
                          <button
                            onClick={() => handleStop(container.container_id)}
                            disabled={isMutatingThis}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
                              isStopping && stoppingContainerId === container.container_id
                                ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 animate-pulse'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Stop container"
                          >
                            <Square className="w-2.5 h-2.5 fill-current" />
                            <span>Stop</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStart(container.container_id)}
                            disabled={isMutatingThis}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
                              isStarting && startingContainerId === container.container_id
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 animate-pulse'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Start container"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Start</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRestart(container.container_id)}
                          disabled={isMutatingThis}
                          className={`p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition-colors cursor-pointer ${
                            isRestarting && restartingContainerId === container.container_id
                              ? 'text-sky-400 animate-spin'
                              : ''
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Restart container"
                          aria-label="Restart container"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openLogs(container.container_id, container.name)}
                          className="p-1 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition-colors cursor-pointer"
                          title="View live terminal logs"
                          aria-label="View container logs"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
