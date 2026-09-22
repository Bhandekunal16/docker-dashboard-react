import React from 'react';
import { Card } from '../common/Card';

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
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60 shadow-xs shadow-emerald-950/50';
      case 'amber':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/60 shadow-xs shadow-amber-950/50';
      case 'zinc':
        return 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60';
      case 'blue':
      default:
        return 'bg-blue-950/70 text-blue-400 border-blue-800/60 shadow-xs shadow-blue-950/50';
    }
  };

  return (
    <Card
      className={`transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-zinc-700 hover:bg-zinc-900/90' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {title}
          </span>
          <div className="mt-2 text-3xl font-bold font-mono tracking-tight text-zinc-100">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl border ${getIconStyles()}`}>
          {icon}
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-3.5 flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-800/60">
          <span>{subtitle}</span>
          {badge && <div>{badge}</div>}
        </div>
      )}
    </Card>
  );
};
