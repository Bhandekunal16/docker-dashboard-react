import React from 'react';
import { Card } from '../common/Card';
import { Activity, CheckCircle2, Layers, HardDrive } from 'lucide-react';
import { Container } from '../../types/container';
import { DockerImage } from '../../types/image';
import { parseContainerStatus, formatBytes } from '../../utils/formatters';
import { ResourceTrendsChart } from './ResourceTrendsChart';
import { DiskUsage } from '../../api/hostResources';

interface StatusOverviewProps {
  containers: Container[];
  images: DockerImage[];
  hostResources?: {
    cpu: { usagePercent: number };
    memory: { usagePercent: number };
    disk: DiskUsage;
  };
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({ containers, images, hostResources }) => {
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
      <div className="flex items-center gap-2.5 sm:gap-3 pb-3 border-b border-zinc-800/60 mb-3.5">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-100 leading-snug truncate">
            Host Resources Overview
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-tight truncate">
            Real-time CPU and memory telemetry, lifecycle distribution, and host resource utilization
          </p>
        </div>
      </div>

      <div className="space-y-3.5">
        {/* 2. D3 Real-Time Resource Trends Chart (30m CPU & Memory) */}
        <ResourceTrendsChart
          cpuUsage={hostResources?.cpu.usagePercent}
          memoryUsage={hostResources?.memory.usagePercent}
        />

        {/* 3. Lifecycle Distribution */}
        <div className="pt-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11px] font-mono mb-1.5">
            <span className="text-zinc-300 font-medium">Container Lifecycle Distribution</span>
            <span className="text-zinc-400">{totalContainers} Total</span>
          </div>

          {/* Progress Bar (8px tall) */}
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex">
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
          <div className="mt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono text-zinc-400">
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

        {/* 4. Polished Workload & Host Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {/* Card 1: Active Workloads */}
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 flex flex-col justify-between gap-2.5 hover:border-zinc-700/70 transition-all duration-150 group select-none">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-xs sm:text-[13px] font-medium text-zinc-200 truncate leading-tight">
                  Active Workloads
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5 leading-tight">
                  Serving container instances
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-zinc-800/40">
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {runningContainers}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{totalContainers > 0 ? `${Math.round(runningPct)}% active` : '0 tasks'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Image Utilization */}
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 flex flex-col justify-between gap-2.5 hover:border-zinc-700/70 transition-all duration-150 group select-none">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-xs sm:text-[13px] font-medium text-zinc-200 truncate leading-tight">
                  Image Utilization
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5 leading-tight">
                  Referenced vs cached images
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-zinc-800/40">
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 group-hover:text-purple-400 transition-colors">
                {imagesWithContainers}{' '}
                <span className="text-xs sm:text-sm text-zinc-500 font-normal font-mono">
                  / {totalImageCount}
                </span>
              </div>
              <div className="text-[11px] font-mono text-purple-400/90 shrink-0">
                {totalImageCount > 0
                  ? `${Math.round((imagesWithContainers / totalImageCount) * 100)}% active`
                  : '0 cached'}
              </div>
            </div>
          </div>

          {/* Card 3: Host Disk Usage */}
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60 flex flex-col justify-between gap-2.5 hover:border-zinc-700/70 transition-all duration-150 group select-none">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <div className="text-xs sm:text-[13px] font-medium text-zinc-200 truncate leading-tight">
                  Host Disk Usage
                </div>
                <div className="text-[11px] text-zinc-400 truncate mt-0.5 leading-tight">
                  {hostResources?.disk.mount ? `Mount: ${hostResources.disk.mount}` : 'Storage allocation'}
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <HardDrive className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 pt-1 border-t border-zinc-800/40">
              <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 group-hover:text-amber-400 transition-colors">
                {hostResources ? `${hostResources.disk.usagePercent}%` : '—'}
              </div>
              {hostResources ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-12 h-1.5 bg-zinc-800/90 rounded-full overflow-hidden hidden xs:block">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hostResources.disk.usagePercent >= 80
                          ? 'bg-rose-500'
                          : hostResources.disk.usagePercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, hostResources.disk.usagePercent)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {formatBytes(hostResources.disk.usedBytes)}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-mono text-zinc-500">Standby</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

