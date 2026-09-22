import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Box, Play, Square, RotateCw, Terminal, ArrowRight, Copy, Check } from 'lucide-react';
import { Container } from '../../types/container';
import { StatusBadge, TagBadge } from '../common/Badge';
import { getShortId, parseContainerStatus } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';
import { useContainerMutations } from '../../hooks/useContainers';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../common/EmptyState';

export const RecentContainers: React.FC<{ containers: Container[]; isLoading?: boolean }> = ({
  containers,
}) => {
  const { openLogs, addToast } = useConfig();
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

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayedContainers = containers.slice(0, 5);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    addToast('info', 'Copied ID', `Container ID ${getShortId(id)} copied to clipboard.`);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleStart = async (id: string) => {
    await startContainer({ containerId: id });
  };

  const handleStop = async (id: string) => {
    await stopContainer({ containerId: id });
  };

  const handleRestart = async (id: string) => {
    await restartContainer({ containerId: id });
  };

  return (
    <Card className="h-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/60 mb-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Box className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-100 leading-snug truncate">
              Recent Containers
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-tight truncate">
              Quick overview of primary containers on this host
            </p>
          </div>
        </div>

        {containers.length > 5 && (
          <button
            onClick={() => navigate('/containers')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors shrink-0 select-none"
          >
            <span>View All ({containers.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {containers.length === 0 ? (
        <EmptyState
          icon="container"
          title="No Containers Found"
          description="There are currently no active or stopped Docker containers on this host."
          actionLabel="Go to Containers"
          onAction={() => navigate('/containers')}
        />
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px] table-auto">
            <thead className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-mono border-b border-zinc-800 bg-zinc-950/40 select-none">
              <tr className="h-9">
                <th className="py-2 pl-3 pr-2 font-medium w-28">Container ID</th>
                <th className="py-2 px-3 font-medium">Name</th>
                <th className="py-2 px-3 font-medium">Image</th>
                <th className="py-2 px-3 font-medium w-36">Status</th>
                <th className="py-2 pl-3 pr-4 font-medium text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {displayedContainers.map((container) => {
                const { category, isUp } = parseContainerStatus(container.status);
                const isMutatingThis =
                  (isStarting && startingContainerId === container.container_id) ||
                  (isStopping && stoppingContainerId === container.container_id) ||
                  (isRestarting && restartingContainerId === container.container_id);

                const isCopied = copiedId === container.container_id;

                return (
                  <tr
                    key={container.container_id}
                    className="h-13 hover:bg-zinc-800/30 transition-colors group text-xs align-middle"
                  >
                    {/* 1. Container ID */}
                    <td className="py-2.5 pl-3 pr-2 text-zinc-400 font-mono text-[11px] whitespace-nowrap align-middle w-28">
                      <div className="inline-flex items-center gap-1.5 group/id">
                        <span>{getShortId(container.container_id)}</span>
                        <button
                          onClick={(e) => handleCopy(container.container_id, e)}
                          className="text-zinc-600 group-hover/id:text-zinc-300 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
                          title="Copy container ID"
                          aria-label="Copy container ID"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 2. Container Name */}
                    <td className="py-2.5 px-3 font-medium text-zinc-100 text-xs sm:text-[13px] truncate whitespace-nowrap align-middle" title={container.name}>
                      <span className="truncate block font-mono text-zinc-100 font-semibold max-w-[180px] sm:max-w-[220px]">
                        {container.name || '-'}
                      </span>
                    </td>

                    {/* 3. Image with repository & version badge */}
                    <td className="py-2.5 px-3 align-middle truncate whitespace-nowrap">
                      <TagBadge tag={container.image} maxWidth="max-w-[140px] sm:max-w-[180px]" />
                    </td>

                    {/* 4. Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle w-36">
                      <StatusBadge category={category} label={container.status} size="sm" />
                    </td>

                    {/* 5. Actions: Unified group in flex container with safe right padding */}
                    <td className="py-2.5 pl-3 pr-4 text-right whitespace-nowrap align-middle w-44">
                      <div className="flex items-center justify-end gap-1.5 shrink-0">
                        {/* Start / Stop Button */}
                        {isUp ? (
                          <button
                            onClick={() => handleStop(container.container_id)}
                            disabled={isMutatingThis}
                            className={`h-[30px] inline-flex items-center gap-1 px-2.5 rounded-md text-[11px] font-medium transition-colors border cursor-pointer shrink-0 whitespace-nowrap ${
                              isStopping && stoppingContainerId === container.container_id
                                ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 animate-pulse'
                                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/30 active:bg-rose-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Stop container"
                          >
                            <Square className="w-2.5 h-2.5 fill-current shrink-0" />
                            <span>Stop</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStart(container.container_id)}
                            disabled={isMutatingThis}
                            className={`h-[30px] inline-flex items-center gap-1 px-2.5 rounded-md text-[11px] font-medium transition-colors border cursor-pointer shrink-0 whitespace-nowrap ${
                              isStarting && startingContainerId === container.container_id
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 animate-pulse'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/30 active:bg-emerald-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Start container"
                          >
                            <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                            <span>Start</span>
                          </button>
                        )}

                        {/* Restart Button */}
                        <button
                          onClick={() => handleRestart(container.container_id)}
                          disabled={isMutatingThis}
                          className={`w-[30px] h-[30px] inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer shrink-0 ${
                            isRestarting && restartingContainerId === container.container_id
                              ? 'text-sky-400 animate-spin'
                              : ''
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title="Restart container"
                          aria-label="Restart container"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Logs Button */}
                        <button
                          onClick={() => openLogs(container.container_id, container.name)}
                          className="w-[30px] h-[30px] inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer shrink-0"
                          title="View live container logs"
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
