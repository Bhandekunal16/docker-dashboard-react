import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useConfig } from '../../context/ConfigContext';
import { ToastNotification } from '../../types/api';

export const ToastItem: React.FC<{ toast: ToastNotification; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-800/60 bg-zinc-900/95 text-zinc-100';
      case 'error':
        return 'border-rose-800/60 bg-zinc-900/95 text-zinc-100';
      case 'warning':
        return 'border-amber-800/60 bg-zinc-900/95 text-zinc-100';
      case 'info':
      default:
        return 'border-blue-800/60 bg-zinc-900/95 text-zinc-100';
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md max-w-sm w-full transition-all animate-in slide-in-from-bottom-3 duration-200 ${getBorderColor()}`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-semibold leading-tight">{toast.title}</h5>
        {toast.message && (
          <p className="mt-1 text-xs text-zinc-400 break-words leading-relaxed font-mono">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-500 hover:text-zinc-300 p-1 -mr-1 -mt-1 rounded hover:bg-zinc-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useConfig();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
