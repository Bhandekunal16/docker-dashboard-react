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
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'zinc':
        return 'bg-zinc-800/80 text-zinc-400 border-zinc-700/50';
      case 'blue':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 backdrop-blur-xs shadow-xs transition-all duration-150 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/90 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-medium text-zinc-400 tracking-normal truncate block">
            {title}
          </span>
          <div className="mt-1 text-2xl sm:text-[26px] font-bold font-mono tracking-tight text-zinc-100 leading-none">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-zinc-500 truncate hidden xs:block sm:hidden mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-9 h-9 rounded-lg border shrink-0 flex items-center justify-center ${getIconStyles()}`}>
          <div className="[&>svg]:w-4.5 [&>svg]:h-4.5">
            {icon}
          </div>
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="hidden sm:flex mt-2.5 items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/50">
          <span className="truncate">{subtitle}</span>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}
    </div>
  );
};
