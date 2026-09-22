import React from 'react';
import { Package, Terminal, Box, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: 'container' | 'image' | 'logs' | 'search';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'container',
  title,
  description,
  actionLabel,
  onAction,
  isLoading,
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'image':
        return <Package className="w-8 h-8 text-blue-400" />;
      case 'logs':
        return <Terminal className="w-8 h-8 text-amber-400" />;
      case 'container':
      default:
        return <Box className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800/80 border-dashed">
      <div className="p-3.5 mb-4 rounded-xl bg-zinc-800/80 border border-zinc-700/60 shadow-inner">
        {getIcon()}
      </div>
      <h4 className="text-base font-semibold text-zinc-200">{title}</h4>
      <p className="max-w-sm mt-1 text-sm text-zinc-400">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAction}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
