import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Trash2,
  ArrowDown,
  AlertCircle,
  Play,
  Square,
} from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { useContainerLogs } from '../../hooks/useContainerLogs';
import { parseApiErrorMessage } from '../../api/client';
import { Button } from '../common/Button';

export const LogsDrawer: React.FC = () => {
  const { logsModal, closeLogs, addToast } = useConfig();
  const { isOpen, containerId, containerName } = logsModal;

  const [timestamps, setTimestamps] = useState<boolean>(false);
  const [tail, setTail] = useState<number>(200);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [customContainerId, setCustomContainerId] = useState<string>('');
  const [cleared, setCleared] = useState<boolean>(false);

  const activeId = customContainerId || containerId;

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomContainerId(containerId);
      setCleared(false);
    }
  }, [isOpen, containerId]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useContainerLogs({
    containerId: activeId,
    timestamps,
    tail,
    enabled: isOpen && !!activeId,
    autoRefresh,
    autoRefreshInterval: 3000,
  });

  const logsContent = cleared ? '' : data?.logs || '';

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyLogs = async () => {
    if (!logsContent) return;
    try {
      await navigator.clipboard.writeText(logsContent);
      setIsCopied(true);
      addToast('success', 'Logs Copied', 'Container output copied to clipboard.');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      addToast('error', 'Copy Failed', 'Unable to access clipboard.');
    }
  };

  const handleClear = () => {
    setCleared(true);
  };

  const handleManualRefresh = () => {
    setCleared(false);
    refetch();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={closeLogs}
      />

      {/* Terminal Modal Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logs-modal-title"
        className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-md bg-zinc-950 text-blue-400 border border-zinc-800 shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="logs-modal-title" className="text-sm font-bold text-zinc-100 font-mono truncate">
                  {containerName || activeId}
                </h3>
                {containerName && (
                  <span className="text-xs text-zinc-500 font-mono shrink-0">
                    ({activeId.slice(0, 12)})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeLogs}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close logs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 text-xs gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Timestamps toggle */}
            <button
              onClick={() => setTimestamps(!timestamps)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-mono transition-colors cursor-pointer ${
                timestamps
                  ? 'bg-blue-950/70 text-blue-300 border-blue-800'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timestamps: {timestamps ? 'ON' : 'OFF'}</span>
            </button>

            {/* Tail lines select */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 font-mono">Tail:</span>
              <select
                value={tail}
                onChange={(e) => setTail(Number(e.target.value))}
                className="bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-md px-2 py-1 font-mono text-xs focus:outline-none focus:border-blue-500"
              >
                <option value={50}>50 lines</option>
                <option value={100}>100 lines</option>
                <option value={200}>200 lines</option>
                <option value={500}>500 lines</option>
                <option value={1000}>1000 lines</option>
              </select>
            </div>

            {/* Auto refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-mono transition-colors cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {autoRefresh ? (
                <>
                  <Square className="w-3 h-3 fill-emerald-400 text-emerald-400 animate-pulse" />
                  <span>Live Stream (3s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-zinc-400" />
                  <span>Stream</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              isLoading={isFetching && !autoRefresh}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLogs}
              disabled={!logsContent}
              leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!logsContent}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Terminal Screen Body */}
        <div className="flex-1 bg-zinc-950 p-4 overflow-y-auto font-mono text-xs text-zinc-200 leading-relaxed select-text min-h-0">
          {isLoading && !data ? (
            <div className="flex items-center justify-center h-full text-zinc-500 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Fetching container logs...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Failed to fetch container logs</div>
                <div className="mt-1 font-mono text-xs opacity-90">
                  {parseApiErrorMessage(error)}
                </div>
              </div>
            </div>
          ) : !logsContent ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-1.5">
              <Terminal className="w-8 h-8 opacity-30" />
              <span>No logs available for container {activeId}</span>
              <span className="text-[11px] text-zinc-600">
                Container output may be empty or has not produced any stdout/stderr logs yet.
              </span>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-all text-zinc-300 font-mono selection:bg-blue-600 selection:text-white">
              {logsContent}
              <div ref={terminalEndRef} />
            </pre>
          )}
        </div>

        {/* Terminal Footer Info */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-3">
            <span>POST /logs/container</span>
            <span>•</span>
            <span>Tail: {tail}</span>
            <span>•</span>
            <span>Status: {isFetching ? 'Receiving...' : 'Idle'}</span>
          </div>
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Bottom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
