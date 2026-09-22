import React from 'react';
import { Card } from '../common/Card';
import { Box, Package, RefreshCw, Server, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useQueryClient } from '@tanstack/react-query';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { setIsApiConfigModalOpen, addToast } = useConfig();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.refetchQueries();
    addToast('info', 'Host Refreshed', 'Containers and images list updated.');
  };

  const actions = [
    {
      title: 'Inspect Containers',
      description: 'View active ports, start, stop, or view container live logs',
      icon: Box,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      onClick: () => navigate('/containers'),
    },
    {
      title: 'Manage Images',
      description: 'Review Docker images, clean up unused tags and layers',
      icon: Package,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      onClick: () => navigate('/images'),
    },
    {
      title: 'Reload Docker Host',
      description: 'Refresh container states and image catalogs immediately',
      icon: RefreshCw,
      iconColor: 'text-zinc-300 bg-zinc-800/80 border-zinc-700/60',
      onClick: handleRefresh,
    },
    {
      title: 'API Settings',
      description: 'Configure endpoint base URL or test server connectivity',
      icon: Server,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      onClick: () => setIsApiConfigModalOpen(true),
    },
  ];

  return (
    <Card className="h-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 pb-3 border-b border-zinc-800/60 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-100 leading-snug truncate">
            Quick Operations
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-tight truncate">
            Common management tasks and navigation shortcuts
          </p>
        </div>
      </div>

      {/* Operations List: Compact Navigation Rows with Subtle Separators */}
      <div className="divide-y divide-zinc-800/50 rounded-lg overflow-hidden border border-zinc-800/60 bg-zinc-950/30">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              onClick={action.onClick}
              className="p-2.5 sm:p-3 hover:bg-zinc-800/40 active:bg-zinc-800/60 transition-colors cursor-pointer group flex items-center justify-between gap-3 select-none"
            >
              {/* Left Fixed Icon (30-34px) */}
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${action.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Middle Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors leading-tight">
                  {action.title}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug truncate">
                  {action.description}
                </p>
              </div>

              {/* Far-Right Arrow */}
              <div className="shrink-0 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all pl-1">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
