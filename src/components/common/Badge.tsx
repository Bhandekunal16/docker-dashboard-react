import React from 'react';
import { ContainerStateCategory } from '../../types/container';

interface StatusBadgeProps {
  category: ContainerStateCategory | string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  category,
  label,
  className = '',
  size = 'md',
}) => {
  const normalized = category.toLowerCase();

  let styles = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
  let dotColor = 'bg-zinc-400';

  if (normalized === 'running' || normalized.startsWith('up')) {
    styles = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 shadow-xs shadow-emerald-950/50';
    dotColor = 'bg-emerald-400 animate-pulse';
  } else if (normalized === 'stopped' || normalized.startsWith('exited') || normalized === 'dead') {
    styles = 'bg-zinc-900/80 text-zinc-400 border-zinc-800';
    dotColor = 'bg-zinc-500';
  } else if (normalized === 'restarting') {
    styles = 'bg-sky-950/60 text-sky-300 border-sky-800/60';
    dotColor = 'bg-sky-400 animate-spin';
  } else if (normalized === 'paused') {
    styles = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    dotColor = 'bg-amber-400';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-md border ${sizeStyles} ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="truncate max-w-[200px]">{label || category}</span>
    </span>
  );
};

export const TagBadge: React.FC<{ tag: string; className?: string }> = ({ tag, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-blue-950/50 text-blue-300 border border-blue-800/50 ${className}`}
      title={tag}
    >
      {tag}
    </span>
  );
};

export const PortBadge: React.FC<{ port: string }> = ({ port }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-zinc-900 text-zinc-300 border border-zinc-800">
      {port}
    </span>
  );
};
