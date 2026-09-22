export interface ApiErrorResponse {
  error?: string | {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  details?: string;
  message?: string;
}

export type ConnectionStatusType = 'connected' | 'error' | 'loading' | 'idle';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  timestamp: number;
}
