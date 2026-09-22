import React from 'react';
import {
  Play,
  Square,
  RotateCw,
  Trash2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Container } from '../../types/container';
import { StatusBadge, TagBadge, PortBadge } from '../common/Badge';
import { Button } from '../common/Button';
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
  const [isCopied, setIsCopied] = React.useState(false);

  const { category, isUp } = parseContainerStatus(container.status);
  const parsedPorts = formatPorts(container.ports);
  const isAnyMutating = isStarting || isStopping || isRestarting || isRemoving;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(container.container_id);
      setIsCopied(true);
      addToast('info', 'ID Copied', `Container ID ${getShortId(container.container_id)} copied.`);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <tr className="hover:bg-zinc-850/60 transition-colors group">
      {/* Container ID */}
      <td className="py-3 px-4 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span title={container.container_id}>{getShortId(container.container_id)}</span>
          <button
            onClick={handleCopyId}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-opacity"
            title="Copy container ID"
            aria-label="Copy container ID"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </td>

      {/* Name */}
      <td className="py-3 px-4">
        <div className="font-semibold text-zinc-100 text-xs font-sans">
          {container.name || '-'}
        </div>
      </td>

      {/* Image */}
      <td className="py-3 px-4">
        <TagBadge tag={container.image} />
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge category={category} label={container.status} size="sm" />
      </td>

      {/* Ports */}
      <td className="py-3 px-4">
        {parsedPorts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {parsedPorts.map((p, idx) => (
              <PortBadge
                key={idx}
                port={p.host !== '-' ? `${p.host}->${p.container}` : `${p.container}/${p.protocol}`}
              />
            ))}
          </div>
        ) : (
          <span className="text-xs text-zinc-600 font-mono">-</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center justify-end gap-1.5">
          {/* Start / Stop */}
          {isUp ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStop(container.container_id)}
              isLoading={isStopping}
              disabled={isAnyMutating}
              leftIcon={<Square className="w-3 h-3 fill-rose-400 text-rose-400" />}
              title="Stop container"
            >
              Stop
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStart(container.container_id)}
              isLoading={isStarting}
              disabled={isAnyMutating}
              leftIcon={<Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />}
              title="Start container"
            >
              Start
            </Button>
          )}

          {/* Restart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRestart(container.container_id)}
            isLoading={isRestarting}
            disabled={isAnyMutating}
            title="Restart container"
            aria-label="Restart container"
          >
            <RotateCw className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-200" />
          </Button>

          {/* Logs */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openLogs(container.container_id, container.name)}
            title="View Logs"
            aria-label="View container logs"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400 hover:text-blue-300" />
          </Button>

          {/* Remove */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(container)}
            isLoading={isRemoving}
            disabled={isAnyMutating}
            className="hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400"
            title="Remove container"
            aria-label="Remove container"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
