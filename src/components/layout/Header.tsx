import React from 'react';
import { Menu, RefreshCw, Settings, CheckCircle2, AlertCircle, Loader2, Keyboard } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { Button } from '../common/Button';

export const Header: React.FC<{ onToggleMobileMenu: () => void }> = ({
  onToggleMobileMenu,
}) => {
  const {
    connectionStatus,
    checkConnection,
    setIsApiConfigModalOpen,
    setIsShortcutsModalOpen,
    apiBaseUrl,
  } = useConfig();
  const queryClient = useQueryClient();
  const isFetchingAny = useIsFetching();

  const handleRefreshAll = async () => {
    await queryClient.refetchQueries();
    await checkConnection();
  };

  const renderConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <button
            onClick={() => setIsApiConfigModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition-colors cursor-pointer"
            title={`Connected to ${apiBaseUrl} - Click to change`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">API Connected</span>
            <span className="sm:hidden">Connected</span>
          </button>
        );
      case 'loading':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-blue-950/70 text-blue-300 border border-blue-800/60"
            title="Testing connection..."
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Checking...</span>
          </span>
        );
      case 'error':
      default:
        return (
          <button
            onClick={() => setIsApiConfigModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80 transition-colors cursor-pointer animate-pulse"
            title={`API unreachable at ${apiBaseUrl} - Click to configure`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Connection Offline</span>
            <span className="sm:hidden">Offline</span>
          </button>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 md:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Connection status indicator */}
        {renderConnectionBadge()}

        {/* Global Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          isLoading={Boolean(isFetchingAny)}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetchingAny ? 'animate-spin' : ''}`} />}
          title="Refresh all queries"
        >
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        {/* Keyboard Shortcuts button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsShortcutsModalOpen(true)}
          title="Keyboard Shortcuts (Press ?)"
          aria-label="Keyboard Shortcuts"
          className="hidden sm:inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <kbd className="text-[10px] font-mono font-medium px-1 py-0.2 rounded bg-zinc-900 border border-zinc-750 text-zinc-400">
            ?
          </kbd>
        </Button>

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsApiConfigModalOpen(true)}
          title="Configure API Base URL"
          aria-label="Configure API Base URL"
        >
          <Settings className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
        </Button>
      </div>
    </header>
  );
};
