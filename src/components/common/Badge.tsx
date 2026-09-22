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
  size = 'sm',
}) => {
  const normalized = category.toLowerCase();

  let styles = 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50';
  let dotColor = 'bg-zinc-400';

  if (normalized === 'running' || normalized.startsWith('up')) {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    dotColor = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]';
  } else if (normalized === 'stopped' || normalized.startsWith('exited') || normalized === 'dead') {
    styles = 'bg-zinc-850/70 text-zinc-400 border-zinc-750';
    dotColor = 'bg-zinc-500';
  } else if (normalized === 'restarting') {
    styles = 'bg-sky-500/10 text-sky-400 border-sky-500/25';
    dotColor = 'bg-sky-400 animate-spin';
  } else if (normalized === 'paused') {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    dotColor = 'bg-amber-400';
  }

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium rounded-full border whitespace-nowrap transition-colors ${sizeStyles} ${styles} ${className}`}
      title={label || category}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span className="truncate max-w-[170px]">{label || category}</span>
    </span>
  );
};

export const TagBadge: React.FC<{ tag: string; className?: string; maxWidth?: string }> = ({
  tag,
  className = '',
  maxWidth = 'max-w-[190px]',
}) => {
  // Check if there's a repository and tag split
  const lastColonIndex = tag.lastIndexOf(':');
  const hasTag = lastColonIndex > 0 && !tag.slice(lastColonIndex).includes('/');

  if (hasTag) {
    const repo = tag.slice(0, lastColonIndex);
    const version = tag.slice(lastColonIndex + 1);

    return (
      <div
        className={`inline-flex items-center gap-1.5 font-mono text-[11px] ${className}`}
        title={tag}
      >
        <span className={`text-zinc-200 truncate ${maxWidth}`} title={repo}>
          {repo}
        </span>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60 shrink-0 font-medium">
          {version}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-zinc-900 text-zinc-200 border border-zinc-800 truncate ${maxWidth} ${className}`}
      title={tag}
    >
      {tag}
    </span>
  );
};

export const PortBadge: React.FC<{ port: string; className?: string }> = ({ port, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-950/90 text-cyan-300/90 border border-zinc-800 whitespace-nowrap hover:border-zinc-700 transition-colors ${className}`}
      title={port}
    >
      {port}
    </span>
  );
};
