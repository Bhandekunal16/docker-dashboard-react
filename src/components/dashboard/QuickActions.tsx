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
    <Card className="flex flex-col h-full">
      {/* Compact Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-zinc-800/80 mb-3 sm:mb-4">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 leading-snug truncate">
            Quick Operations
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 leading-tight truncate">
            Common management tasks and navigation shortcuts
          </p>
        </div>
      </div>

      {/* Operations List: Single column on mobile (<640px), 1-col in sidebar widget on lg, 2-col on sm-md */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-2.5 flex-1">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              onClick={action.onClick}
              className="p-2.5 sm:p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850/70 active:bg-zinc-800/80 transition-all cursor-pointer group flex items-center justify-between gap-2.5 sm:gap-3 select-none"
            >
              {/* Left Fixed Icon */}
              <div
                className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${action.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Middle Title & Description */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors leading-tight">
                  {action.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
                  {action.description}
                </p>
              </div>

              {/* Far-Right Arrow */}
              <div className="shrink-0 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all pl-1">
                <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
