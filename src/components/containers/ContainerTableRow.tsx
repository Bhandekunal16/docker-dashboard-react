import React, { useState } from 'react';
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { Container } from '../../types/container';
import { StatusBadge, TagBadge, PortBadge } from '../common/Badge';
import { getShortId, parseContainerStatus, formatPorts } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';

interface ContainerRowProps {
  container: Container;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onRemove: (container: Container) => void;
  isStarting?: boolean;
  isStopping?: boolean;
  isRestarting?: boolean;
  isRemoving?: boolean;
}

export const ContainerTableRow: React.FC<ContainerRowProps> = ({
  container,
  onStart,
  onStop,
  onRestart,
  onRemove,
  isStarting,
  isStopping,
  isRestarting,
  isRemoving,
}) => {
  const { openLogs, addToast } = useConfig();
  const [isCopied, setIsCopied] = useState(false);
  const [showAllPorts, setShowAllPorts] = useState(false);

  const { category, isUp } = parseContainerStatus(container.status);
  const parsedPorts = formatPorts(container.ports);
  const isAnyMutating = isStarting || isStopping || isRestarting || isRemoving;

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(container.container_id);
      setIsCopied(true);
      addToast('info', 'ID Copied', `Container ID ${getShortId(container.container_id)} copied.`);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const visiblePorts = showAllPorts ? parsedPorts : parsedPorts.slice(0, 2);
  const hiddenPortCount = parsedPorts.length - 2;

  return (
    <tr className="hover:bg-zinc-800/40 transition-colors group text-xs border-b border-zinc-800/60">
      {/* Container ID */}
      <td className="py-2.5 px-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap w-28">
        <div className="flex items-center gap-1">
          <span className="text-zinc-400 font-mono tracking-wider select-all" title={container.container_id}>
            {getShortId(container.container_id)}
          </span>
          <button
            onClick={handleCopyId}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-opacity cursor-pointer"
            title="Copy container ID"
            aria-label="Copy container ID"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </td>

      {/* Name */}
      <td className="py-2.5 px-3.5 max-w-[190px]">
        <div
          className="font-medium text-zinc-100 text-xs truncate whitespace-nowrap"
          title={container.name || '-'}
        >
          {container.name || '-'}
        </div>
      </td>

      {/* Image */}
      <td className="py-2.5 px-3.5 max-w-[220px]">
        <TagBadge tag={container.image} maxWidth="max-w-[170px]" />
      </td>

      {/* Status */}
      <td className="py-2.5 px-3.5 whitespace-nowrap w-36">
        <StatusBadge category={category} label={container.status} size="sm" />
      </td>

      {/* Ports */}
      <td className="py-2.5 px-3.5 max-w-[240px]">
        {parsedPorts.length > 0 ? (
          <div className="flex items-center flex-wrap gap-1">
            {visiblePorts.map((p, idx) => (
              <PortBadge key={idx} port={p.display} />
            ))}
            {!showAllPorts && hiddenPortCount > 0 && (
              <button
                onClick={() => setShowAllPorts(true)}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-750 transition-colors cursor-pointer"
                title={parsedPorts.slice(2).map((p) => p.display).join(', ')}
              >
                +{hiddenPortCount} more
              </button>
            )}
            {showAllPorts && parsedPorts.length > 2 && (
              <button
                onClick={() => setShowAllPorts(false)}
                className="text-[10px] font-mono px-1 py-0.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                show less
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-zinc-600 font-mono">-</span>
        )}
      </td>

      {/* Actions Toolbar */}
      <td className="py-2.5 px-3.5 text-right whitespace-nowrap w-36">
        <div className="inline-flex items-center justify-end gap-1">
          {/* Start / Stop */}
          {isUp ? (
            <button
              onClick={() => onStop(container.container_id)}
              disabled={isAnyMutating}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
                isStopping
                  ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 animate-pulse'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Stop container"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>{isStopping ? 'Stopping...' : 'Stop'}</span>
            </button>
          ) : (
            <button
              onClick={() => onStart(container.container_id)}
              disabled={isAnyMutating}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
                isStarting
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 animate-pulse'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border-emerald-500/20 hover:border-emerald-500/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Start container"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>{isStarting ? 'Starting...' : 'Start'}</span>
            </button>
          )}

          {/* Restart */}
          <button
            onClick={() => onRestart(container.container_id)}
            disabled={isAnyMutating}
            className={`p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition-colors cursor-pointer ${
              isRestarting ? 'text-sky-400 animate-spin' : ''
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Restart container"
            aria-label="Restart container"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Logs */}
          <button
            onClick={() => openLogs(container.container_id, container.name)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 border border-transparent hover:border-zinc-700/60 transition-colors cursor-pointer"
            title="View live terminal logs"
            aria-label="View container logs"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          {/* Remove */}
          <button
            onClick={() => onRemove(container)}
            disabled={isAnyMutating}
            className={`p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer ${
              isRemoving ? 'opacity-50' : ''
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Remove container"
            aria-label="Remove container"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
