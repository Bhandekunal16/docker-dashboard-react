import React from 'react';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { Button } from './Button';
import { useConfig } from '../../context/ConfigContext';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load Docker data',
  message,
  onRetry,
  isRetrying = false,
}) => {
  const { apiBaseUrl, setIsApiConfigModalOpen } = useConfig();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl bg-rose-950/20 border border-rose-800/40">
      <div className="p-3 mb-3 rounded-full bg-rose-900/30 text-rose-400 border border-rose-800/50">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-200">{title}</h4>
      <p className="max-w-md mt-1.5 text-xs text-rose-300/80 font-mono break-all">
        {message || `Could not communicate with the Docker API at ${apiBaseUrl}`}
      </p>

      <div className="flex items-center gap-3 mt-5">
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Connection
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsApiConfigModalOpen(true)}
          leftIcon={<Settings className="w-3.5 h-3.5" />}
        >
          Configure API Base URL
        </Button>
      </div>
    </div>
  );
};
