import React from 'react';
import { Play, Square, RotateCw, Trash2, Terminal, Copy, Check } from 'lucide-react';
import { Container } from '../../types/container';
import { StatusBadge, TagBadge, PortBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { getShortId, parseContainerStatus, formatPorts } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';

interface ContainerCardProps {
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

export const ContainerCard: React.FC<ContainerCardProps> = ({
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
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-zinc-100 font-sans">
              {container.name || 'Unnamed container'}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-zinc-500">
            <span>{getShortId(container.container_id)}</span>
            <button
              onClick={handleCopyId}
              className="p-0.5 hover:text-zinc-300"
              aria-label="Copy ID"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <StatusBadge category={category} label={container.status} size="sm" />
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold w-14">
            Image
          </span>
          <TagBadge tag={container.image} />
        </div>

        <div className="flex items-start gap-2">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider font-semibold w-14 mt-0.5">
            Ports
          </span>
          <div className="flex-1">
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
              <span className="text-zinc-600 font-mono">-</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isUp ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStop(container.container_id)}
              isLoading={isStopping}
              disabled={isAnyMutating}
              leftIcon={<Square className="w-3 h-3 fill-rose-400 text-rose-400" />}
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
            >
              Start
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRestart(container.container_id)}
            isLoading={isRestarting}
            disabled={isAnyMutating}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Restart
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openLogs(container.container_id, container.name)}
            title="View Logs"
            aria-label="View container logs"
          >
            <Terminal className="w-4 h-4 text-blue-400" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(container)}
            isLoading={isRemoving}
            disabled={isAnyMutating}
            className="text-zinc-400 hover:text-rose-400"
            title="Remove container"
            aria-label="Remove container"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
