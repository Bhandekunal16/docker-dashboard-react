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
            <thead className="text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 bg-zinc-950/40">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Container ID</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Image</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {displayedContainers.map((container) => {
                const { category, isUp } = parseContainerStatus(container.status);
                const isMutatingThis =
                  (isStarting && startingContainerId === container.container_id) ||
                  (isStopping && stoppingContainerId === container.container_id) ||
                  (isRestarting && restartingContainerId === container.container_id);

                return (
                  <tr
                    key={container.container_id}
                    className="hover:bg-zinc-850/50 transition-colors group"
                  >
                    <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                      {getShortId(container.container_id)}
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-zinc-200">
                      {container.name || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <TagBadge tag={container.image} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge category={category} label={container.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {isUp ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStop(container.container_id)}
                            isLoading={isStopping && stoppingContainerId === container.container_id}
                            disabled={isMutatingThis}
                            leftIcon={<Square className="w-3 h-3 fill-rose-400 text-rose-400" />}
                            title="Stop container"
                          >
                            Stop
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStart(container.container_id)}
                            isLoading={isStarting && startingContainerId === container.container_id}
                            disabled={isMutatingThis}
                            leftIcon={<Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />}
                            title="Start container"
                          >
                            Start
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestart(container.container_id)}
                          isLoading={isRestarting && restartingContainerId === container.container_id}
                          disabled={isMutatingThis}
                          title="Restart container"
                          aria-label="Restart container"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openLogs(container.container_id, container.name)}
                          title="View Logs"
                          aria-label="View container logs"
                        >
                          <Terminal className="w-3.5 h-3.5 text-blue-400 hover:text-blue-300" />
                        </Button>
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
