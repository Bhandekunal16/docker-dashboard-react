import React from 'react';
import { Card, CardHeader } from '../common/Card';
import { Activity, Box, CheckCircle2, StopCircle, Layers } from 'lucide-react';
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
    <Card>
      <CardHeader
        title="Host Resources Overview"
        subtitle="Distribution of active containers, paused states, and cached Docker images"
        icon={<Activity className="w-5 h-5" />}
      />

      <div className="space-y-6">
        {/* Progress Bar of Container States */}
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-300 font-mono mb-2">
            <span>Container Lifecycle Distribution</span>
            <span>{totalContainers} Total</span>
          </div>

          <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
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

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Running: {runningContainers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span>Stopped: {stoppedContainers}</span>
            </div>
            {otherContainers > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Other: {otherContainers}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick summary grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">Active Workloads</div>
                <div className="text-[11px] text-zinc-400">Currently serving traffic</div>
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {runningContainers}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-950/70 text-blue-400 border border-blue-800/60">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">Images In Use</div>
                <div className="text-[11px] text-zinc-400">Referenced by containers</div>
              </div>
            </div>
            <div className="text-lg font-bold font-mono text-blue-400">
              {imagesWithContainers} <span className="text-xs text-zinc-500">/ {totalImageCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
