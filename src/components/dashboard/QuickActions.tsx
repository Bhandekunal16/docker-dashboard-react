import React from 'react';
import { Card, CardHeader } from '../common/Card';
import { Box, Package, RefreshCw, Server, Zap, ArrowRight } from 'lucide-react';
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
      variant: 'emerald',
      onClick: () => navigate('/containers'),
    },
    {
      title: 'Manage Images',
      description: 'Review Docker images, clean up unused tags and layers',
      icon: Package,
      variant: 'blue',
      onClick: () => navigate('/images'),
    },
    {
      title: 'Reload Docker Host',
      description: 'Refresh container states and image catalogs immediately',
      icon: RefreshCw,
      variant: 'zinc',
      onClick: handleRefresh,
    },
    {
      title: 'API Settings',
      description: 'Configure endpoint base URL or test server connectivity',
      icon: Server,
      variant: 'amber',
      onClick: () => setIsApiConfigModalOpen(true),
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Quick Operations"
        subtitle="Common management tasks and navigation shortcuts"
        icon={<Zap className="w-5 h-5 text-amber-400" />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <div
              key={idx}
              onClick={action.onClick}
              className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/80 transition-all cursor-pointer group flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-300 group-hover:text-blue-400 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    {action.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
