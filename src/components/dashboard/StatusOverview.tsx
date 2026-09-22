import React from 'react';
import { Card } from '../common/Card';
import { Activity, CheckCircle2, Layers } from 'lucide-react';
import { Container } from '../../types/container';
import { DockerImage } from '../../types/image';
import { parseContainerStatus } from '../../utils/formatters';

interface StatusOverviewProps {
  containers: Container[];
  images: DockerImage[];
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({ containers, images }) => {
  const totalContainers = containers.length;
  const runningContainers = containers.filter(
    (c) => parseContainerStatus(c.status).category === 'running'
  ).length;
  const stoppedContainers = containers.filter(
    (c) => parseContainerStatus(c.status).category === 'stopped'
  ).length;
  const otherContainers = totalContainers - runningContainers - stoppedContainers;

  const runningPct = totalContainers > 0 ? (runningContainers / totalContainers) * 100 : 0;
  const stoppedPct = totalContainers > 0 ? (stoppedContainers / totalContainers) * 100 : 0;
  const otherPct = totalContainers > 0 ? (otherContainers / totalContainers) * 100 : 0;

  // Calculate approximate image sizes
  const totalImageCount = images.length;
  const imagesWithContainers = images.filter((img) => img.Containers > 0).length;

  return (
    <Card className="h-auto">
      {/* 1. Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 pb-3 sm:pb-3.5 border-b border-zinc-800/80 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 leading-snug truncate">
            Host Resources Overview
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-tight truncate">
            Distribution of active containers, paused states, and cached Docker images
          </p>
        </div>
      </div>

      <div className="space-y-3.5 sm:space-y-4">
        {/* 2. Lifecycle Distribution */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px] sm:text-xs font-mono mb-2">
            <span className="text-zinc-300 font-medium">Container Lifecycle Distribution</span>
            <span className="text-zinc-400">{totalContainers} Total</span>
          </div>

          {/* Progress Bar (8-10px tall) */}
          <div className="h-2 sm:h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
            {runningPct > 0 && (
              <div
                style={{ width: `${runningPct}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Running: ${runningContainers} (${Math.round(runningPct)}%)`}
              />
            )}
            {stoppedPct > 0 && (
              <div
                style={{ width: `${stoppedPct}%` }}
                className="bg-zinc-600 transition-all duration-300"
                title={`Stopped: ${stoppedContainers} (${Math.round(stoppedPct)}%)`}
              />
            )}
            {otherPct > 0 && (
              <div
                style={{ width: `${otherPct}%` }}
                className="bg-sky-500 transition-all duration-300"
                title={`Other: ${otherContainers} (${Math.round(otherPct)}%)`}
              />
            )}
            {totalContainers === 0 && (
              <div className="w-full bg-zinc-800/80 text-center text-[10px] text-zinc-500" />
            )}
          </div>

          {/* Legend directly below progress bar */}
          <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Running: {runningContainers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>Stopped: {stoppedContainers}</span>
            </div>
            {otherContainers > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Other: {otherContainers}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3 & 4. Resource Summary Cards: Single-column on mobile (<640px), 2-col on desktop (sm/md/lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-0.5">
          {/* Active Workloads */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-[13px] font-medium text-zinc-200 truncate leading-tight">
                  Active Workloads
                </div>
                <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5 leading-tight">
                  Currently serving traffic
                </div>
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 shrink-0 pl-1">
              {runningContainers}
            </div>
          </div>

          {/* Images In Use */}
          <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-[13px] font-medium text-zinc-200 truncate leading-tight">
                  Images In Use
                </div>
                <div className="text-[10px] sm:text-[11px] text-zinc-400 truncate mt-0.5 leading-tight">
                  Referenced by containers
                </div>
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-purple-400 shrink-0 pl-1">
              {imagesWithContainers} <span className="text-[11px] sm:text-xs text-zinc-500">/ {totalImageCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
