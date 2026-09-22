import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'zinc' | 'amber';
  badge?: React.ReactNode;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
  badge,
  onClick,
}) => {
  const getIconStyles = () => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'zinc':
        return 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60';
      case 'blue':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 sm:p-5 backdrop-blur-xs shadow-xs transition-all duration-150 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/90 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center sm:items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 truncate block">
            {title}
          </span>
          <div className="mt-0.5 sm:mt-2 text-xl sm:text-3xl font-bold font-mono tracking-tight text-zinc-100 leading-none">
            {value}
          </div>
          {subtitle && (
            <p className="text-[10px] text-zinc-500 truncate hidden xs:block sm:hidden mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl border shrink-0 flex items-center justify-center ${getIconStyles()}`}>
          {/* Mobile compact icon */}
          <div className="sm:hidden [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </div>
          {/* Desktop full icon */}
          <div className="hidden sm:block [&>svg]:w-6 [&>svg]:h-6">
            {icon}
          </div>
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="hidden sm:flex mt-3.5 items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800/60">
          <span className="truncate">{subtitle}</span>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}
    </div>
  );
};
